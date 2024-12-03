+++
title = "[WIP] Building SoCalendar - TUI"
date = 2024-12-03
description = "Building interfaces with Ratatui"
+++

This post is currently WIP

# Basics of Rendering

In order to draw to the screen in Ratatui we call `terminal.draw` on the terminal struct we create with Ratatui. `draw` accepts a closure of a `frame` which is where we can write all our rendering logic.

Using the Elm Architecture with Ratatui means making use of a `view` function. The signature of which will be `fn view(model: &Model, frame: &mut Frame)`. `model` here is the app model with all your state in and `frame`. So in our main loop for our app we will have the following:

```rust
loop {
	terminal.draw(|frame| view(&model, frame));

	// handle events

	if done_condition {
		break;
	}
}
```

A `Frame` is an abstraction that represents a view into a terminal. One important piece of state that the frame owns is a `Buffer` which is the raw text buffer that can be drawn to in that frame. The main method on `Frame` that is useful to us for rendering is `frame.render_widget<W>(&mut self, widget: W, area: Rect)`. Out of self the frame then uses its buffer to do the actual drawing.

So what are the other two arguments, `widget: W` and `area: Rect`?

A widget is anything that implements the `Widget` trait, which has one required method: `fn render(self, area: Rect, buf: &mut Buf)`. So a widget also takes in an area and a buffer for the drawing, but what is this `Rect` for?

`Rect` is a data struct that contains an x and y coordinate and a width and a height. Its simply a coordinate based area that we can use to precisely control where we want to render things into the buffer.

## Widgets

Now we've seen the basic building blocks how can we actually use widgets to start rendering some interfaces? Widgets are designed to be reusable building blocks. One of the key properties we can see with the functions above is that a widget is passed in the buffer for drawing. This means that a widget can render another widget inside itself, using custom defined `Rect` areas to control more precise positioning.

In practice that might look something like this:
```rust
struct DayEventsWidget {
	date: DateTime<Local>,
	events: Vec<Event>,
}

// Renders a box with the date at the top and the number of events below
impl Widget for DayEventsWidget {
	fn render(self, area: Rect, buf: &mut Buffer) {
		// TODO: vertical constraint with two bits in
		let vertical_constraints = 

		// Render the date widget into the top part of the layout
		let date_widget = DateWidget { date: self.date };
		date_widget.render(vertical_layout[0], buf);
		
		// Render the number of events into the bottom part of the layout
		let num_events = format!("{} events", events.len());
		let num_events_widget = Paragraph::new(num_events);
		num_events_widget.render(vertical_layout[1], buf);
	}
}

struct DateWidget {
	date: DateTime<Local>,
}

// Renders a date time as "27 June"
impl Widget for DateWidget {
	fn render(self, area: Rect, buf: &mut Buffer) {
		let formatted_date = format_date_nicely(self.date);

		
	}
}
```

And then to render those inside the `view` function would be:
```rust
fn view(model: &Model, frame: &mut Frame) {
	let day_widget = DayEventsWidget { date: model.date, events: model.events };

	// Render that widget in a rectangle the full size of the frame
	frame.render_widget(day_widget, frame.area;
}
```

## Palette

I had a couple of technical requirements the app palette had to meet:
1. had to be global, don't want to need to pass it around everywhere
2. needed to be able to be mutated in a background thread since I want the option to match the system theme
3. needs to be ergonomic to access the values from it

In order to achieve 1. I turned to `once_cell` as it provides a good way of creating lazily initialised statics. Given that it will be initialised anytime the app is loaded there isn't really a need to do it lazily, but doing so is as simple as not. We love a pit of success.

The palette itself will contain things like `bg`, `fg` etc. So the static palette is created as follows:
```rust
pub struct Palette {
	bg: ratatui::style::Color,
	fg: ratatui::style::Color,
}

pub static PALETTE: Lazy<Palette> = Lazy::new(|| Palette::get());
```

The second requirement is that the palette can be updated inside a background thread. The thread will be a simple loop that sleeps and then checks the system theme to determine if the palette is correct. This is going to require a synchronisation primitive, either `RwLock` or `Mutex`. I opted for `RwLock` because it feels more semantically correct, the majority of consumers will only ever need read access. Again this is semantic more than anything, there won't actually ever be concurrent readers since the rendering is all synchronous, a `Mutex` would do the exact same job here.

The static palette now looks as follows:

```rust
pub static PALETTE: Lazy<RwLock<Palette>> = Lazy::new(|| Palette::get().into());
```

So the code for the theme checking thread will loop continuously, assign the new palette, and then sleep for a bit. Note here that the palette mutation needs to be in a block so that it is dropped before the await point, this yields to Tokio's scheduler and would cause problems because the lock would be held for the whole sleep time.

```rust
async fn theme_thread() {
	loop {
		{
			let mut palette = PALETTE.write().expect("lock poisoned");
			*palette = Palette::get();
		}
		tokio::time::sleep(Duration::from_secs(5)).await;
	}
}
```

The `get` function for `Palette` uses the `is_dark_theme` crate to check the current system theme, and returns the appropriate palette per theme.

```rust
impl Palette {
    pub fn get() -> Self {
        match is_dark_theme::global_default_theme() {
            Some(is_dark_theme::Theme::Dark) => Palette::dark(),
            _ => Palette::light(),
        }
    }
}
```

The third and final requirement I set was that it needs to be ergonomic to access the fields from the palette. These are going to be used all over the place, having to `.read().expect("blah")` all over the place is not gonna cut it. One option would be a helper function but this would probably mean needing to clone something or deal with lifetimes. I opted to use a macro, something I've not had to reach for before but this feels like a great application.

The macro will allow access to a field in the palette via `palette!(bg)`. This is what the macro looks like:

```rust
#[macro_export]
macro_rules! palette {
    ($field:ident) => {{
        crate::tui::palette::PALETTE
            .read()
            .expect("palette lock poisoned")
            .$field
    }};
}
```

It accepts field as an ident and then does the reading and expecting for me, followed by accessing the field. This was super easy to do and makes working with the palette so much cleaner. It also comes with some nice compile time checks that the fields actually exist. Doing `palette!(not_in_palette)` will inform the developer that the field does not exist on `Palette`. Sweet.
