+++
title = "A Classy Refactoring"
date = 2021-11-29
description = "Kotlin has a lot of nice extensions to Java classes to help with abstracting complex data representations and its about time they get released into my project..."
+++

Picture the scene. An application that gathers demographic information from patients ready for use in medical diagnosis. The user will be asked a range of questions, and these are in various forms. Some are radio buttons, others are text fields. However, some are more complex. Radio buttons can be combined with a textbox if a certain radio button is clicked, checkbox fields can have multiple boxes checked but only one if it is the 'None of the above' option. So how to represent the responses of the patient in the code?

## Messily, at the moment

First lets look at the easiest one, radio buttons. Radio buttons are those round buttons that only let you click one option.

The options for the buttons are currently stored in enum classes, which is fine. The issue is that these are then stored directly in the viewmodel, without any additional abstraction.

```Kotlin
enum class Gender { NONE_SELECTED, Male, Female, Neutral }

// In viewmodel
val _gender = MutableLiveData(FormConstants.Gender.NONE_SELECTED)
```

The values are set in the viewmodel, again this is actually fine.

```Kotlin
fun setGender(gender: FormConstants.Gender) {
    _gender.value = gender
}
```

Then the validation is also handled in the viewmodel.

```Kotlin
fun validateGender() {
    when (_gender.value) {
        FormConstants.Gender.NONE_SELECTED -> {
            val newErrors = _demographicsErrors.value?.toMutableList() ?: mutableListOf()
            newErrors.add(R.string.no_gender_selected)
            _demographicsErrors.value = newErrors
            _validGender.value = FormConstants.FormValidationState.Invalid
        }
        else -> _validGender.value = FormConstants.FormValidationState.Valid
    }
}
```

This is one of the main things I want to change, I want the validation of a response to be handled by the response. This means that if the validation requirements of a response change then it can be found easily and changed for any place that response is used.

Now lets look at one a bit more complex, the name response. The user can enter their name but they also have a checkbox for unknown. If they choose unknown then the textbox for the name is disabled. Currently this is represented in the viewmodel with two separate fields.

```Kotlin
val _name = MutableLiveData("")
val _unknownName = MutableLiveData(false)
```

Setting is performed by two separate functions, one for setting the name and one for toggling unknown.

```Kotlin
fun setName(name: String) {
    _name.value = name
}

fun setUnknownName(isUnknown: Boolean) {
    _unknownName.value = isUnknown
}
```

Again, the viewmodel has the validation function.

```Kotlin
val newErrors = _demographicsErrors.value?.toMutableList() ?: mutableListOf()
    if (unknownName.value == true) {
        _validName.value = FormConstants.FormValidationState.Valid
    } else {
        if (!FormValidation.isNonEmptyString(_name.value)) {
            newErrors.add(R.string.name_cannot_be_empty)
            _validName.value = FormConstants.FormValidationState.Invalid
        } else if (FormValidation.containsNumbers(_name.value)) {
            newErrors.add(R.string.name_cannot_contain_numbers)
            _validName.value = FormConstants.FormValidationState.Invalid
        } else {
            _validName.value = FormConstants.FormValidationState.Valid
        }
    }
    _demographicsErrors.value = newErrors
```

It is worth pointing out now how the validation function works, and why the list of errors is needed. When the user clicks to go to the next page the form is validated, if there are errors then these need to be tracked so the user can be informed. The error list is a list of the ids of the string resources that represent the errors. So like can be seen above for the name validation, if the name contains numbers then the error that explains what is wrong is added to the list.

The issue is a bit more apparent for this response type. Here two different fields in the viewmodel are considered for the validation, when really they are the same response. An implementation that encapsulates both parts in a single response would be much easier to understand and modify later.

## A Better System is Needed

A key characteristic in the name response is that the user can either enter a name, or select unknown, but not both. So we need some data type that will capture this behaviour.

I like the way Rust implements enums, different values in the enums can hold different data, or none at all.

```Rust
enum NameResponse {
    Name(&str),
    Unknown,
}
```

The above implementation would be ideal. Then the response could be a `NameResponse`, it would either be `NameResponse::Name("users name")` or `NameResponse::Unknown`.

So, can we implement this type of system using Kotlin? Java does have support for enums with values, but it's not really very nice.

```Java
public enum NameResponse{
    Name,
    Unknown;

    public final String value;

    public NameResponse(String value) {
        this.value = value;
    }
}
```

Fortunately, as is generally the case, Kotlin's syntax is much nicer.

```Kotlin
enum NameResponse(value: String) { Name, Unknown }
```

But it still has the issue that the value is then required for every enum type, the `Unknown` value doesn't need to hold any data. This is where *sealed classes* come in.

### A Kotlin Mascot in Crab's Clothing

> This title would have been better if the Kotlin Mascot had a name, or if it was an animal. Or if it had any redeeming features.

The Rust implementation above can be recreated very well using the sealed class.

```Kotlin
sealed class NameResponse {
    class Name(val name: String = ""): NameResponse()
    object Unknown: NameResponse()
}
```

Okay the syntax isn't quite as succinct but it does now have the functionality we are after. The viewmodel can then hold a `NameResponse` instead of two separate fields.

```Kotlin
val _nameResponse = MutableLiveData<NameResponse>(NameResponse.Name())
```

Now we need to handle setting the response. This will be handled by two separate functions as before, although modified.

```Kotlin
fun setName(name: String) {
    _nameResponse.value = NameResponse.Name(name)
}

fun setUnknownName(isUnknown: Boolean) {
    when (isUnknown) {
        true -> _nameResponse.value = NameResponse.Unknown
        else -> _nameResponse.value = NameResponse.Name()
    }
}
```

Here we can see that if the checkbox for unknown name is set to checked then the response is set to `Unknown`, otherwise it is returned to a blank text response.

### Seeking Validation

Now let's look to the other goal, moving validation to within the response. A validation function can be added to the sealed class, but we also need to consider what it should return.

I want to maintain the ability to reference the appropriate error string resource depending on the validation and make it easy for the viewmodel to track these when they come in. This can be done with *another* sealed class.

```Kotlin
sealed class ValidationResponse {
    object Valid: ValidationResponse()
    class Invalid(val reason: Int): ValidationResponse()
}
```

Now the validation function for the name response can make use of this new type.

```Kotlin
sealed class NameResponse {
    class Name(val name: String = ""): NameResponse()
    object Unknown: NameResponse()

    fun isValid(): ValidationResponse {
        return when (this) {
            is Name -> {
                val name = this.name

                // name cannot be a bunch of spaces
                if (name.isBlank()) {
                    // return the error that says "Name cannot be empty"
                    return ValidationResponse.Invalid(R.string.name_cannot_be_empty)
                }

                // name cannot contain numbers, sorry Elon should have picked a proper name
                if (name.contains(Regex("[0-9]+"))) {
                    // return the error that says "Name cannot contain numbers"
                    return ValidationResponse.Invalid(R.string.name_cannot_contain_numbers)
                }

                return ValidationResponse.Valid
            }
            is Unknown -> ValidationResponse.Valid
        }
    }
}
```

Great! Now the response will either be `Valid`, meaning the response is ok, or `Invalid` and will contain the id of the appropriate error string. Much better. If extra validation steps are added later on to the name then they can easily be added in the appropriate response class, rather than in the viewmodel.

The viewmodel still needs to call the validation though, and it should handle the error ids is there are any.

```Kotlin
fun validateName() {
    val newErrors = errors.value?.toMutableList() ?: mutableListOf()
    when (val validationResponse = nameResponse.value?.isValid()) {
        is ValidationResponse.Valid -> validNameResponse.value = FormValidationState.Valid
        // add the error that will be shown to the user to the list
        is ValidationResponse.Invalid -> {
            newErrors.add(validationResponse.reason)
            validNameResponse.value = FormValidationState.Invalid
        }
    }
    // live data will not alert observers if its contained values change,
    // so instead the value must be fully reassigned
    errors.value = newErrors
}
```

Great, now we have a much simpler validation function in the viewmodel, one that hands off the bulk of the validation to the response class itself.

### Back to Genders

The genders response from earlier can be given a similar treatment, with some slight modifications since it doesn't need to track two possible types of responses.

```Kotlin
enum class GenderResponse {
    // 👇 need to represent the default state of radio buttons when none is selected
    Pending, Male, Female, Neutral;
    
    fun isValid(): ValidationResponse {
        return when (this) {
            is Pending -> ValidationResponse.Invalid(R.string.no_gender_selected)
            else -> ValidationResponse.Valid
        }
    }    
}
```

Lovely. The validation function in the viewmodel gets the same treatment as the name.

```Kotlin
fun validateGender() {
    val newErrors = errors.value?.toMutableList() ?: mutableListOf()
    when (val validationResponse = genderResponse.value?.isValid()) {
        is ValidationResponse.Valid -> validGenderResponse.value = FormValidationState.Valid
        is ValidationResponse.Invalid -> {
            newErrors.add(validationResponse.reason)
            validGenderResponse.value = FormValidationState.Invalid
        }
    }
    errors.value = newErrors
}
```

### Check Your Checkboxes

There was another type of response mentioned in the introduction that needs a more significant facelift. Some of the questions require that multiple checkboxes can be checked, except only one if the option is 'None of the above'. Even worse is that the user may be given the option of 'Other' and then they can enter a custom value.

*Shudders.*

Currently this is done, well, I'll just let you look.

```Kotlin
class Medication(
    private val _none: MutableLiveData<Boolean> = MutableLiveData(false),
    val none: LiveData<Boolean> = _none,
    private val _warfarin: MutableLiveData<Boolean> = MutableLiveData(false),
    val warfarin: LiveData<Boolean> = _warfarin,
    private val _digoxin: MutableLiveData<Boolean> = MutableLiveData(false),
    val digoxin: LiveData<Boolean> = _digoxin,
    private val _bBlockers: MutableLiveData<Boolean> = MutableLiveData(false),
    val bBlockers: LiveData<Boolean> = _bBlockers,
    private val _cancer: MutableLiveData<Boolean> = MutableLiveData(false),
    val cancer: LiveData<Boolean> = _cancer,
    private val _other: MutableLiveData<Boolean> = MutableLiveData(false),
    val other: LiveData<Boolean> = _other,
    private val _otherText: MutableLiveData<String> = MutableLiveData(""),
    val otherText: LiveData<String> = _otherText
) {
    fun setNone(isSelected: Boolean) {
        _none.value = isSelected
        _warfarin.value = false
        _digoxin.value = false
        _bBlockers.value = false
        _cancer.value = false
        _other.value = false
    }

    fun setWarfarin(isSelected: Boolean) {
        _warfarin.value = isSelected
        _none.value = false
    }

    fun setDigoxin(isSelected: Boolean) {
        _digoxin.value = isSelected
        _none.value = false
    }

    fun setBBlockers(isSelected: Boolean) {
        _bBlockers.value = isSelected
        _none.value = false
    }

    fun setCancer(isSelected: Boolean) {
        _cancer.value = isSelected
        _none.value = false
    }

    fun setOther(isSelected: Boolean) {
        _other.value = isSelected
        _none.value = false
    }

    fun setOtherText(text: String) {
        _otherText.value = text
    }

    fun validateSelf(): Boolean {
        if (_other.value == true && _otherText.value?.isNotBlank() == true) {
            return true
        } else if (_other.value == true && _otherText.value?.isNotBlank() == false) {
            return false
        }

        return _none.value == true
                || _warfarin.value == true
                || _digoxin.value == true
                || _bBlockers.value == true
                || _cancer.value == true
    }
}
```

Yeah. It's not all bad, this one already has its own validation function contained within itself, yay. Also, yes, that is live data contained within the class that will be stored in other live data.

Okay, back to the drawing board. First let's encapsulate the options of the checkboxes in a better way, with enums.

```Kotlin
enum class Medication { Warfarin, Digoxin, BBlockers, Cancer }
```

Now the sealed class. It needs to represent three main states:

1. None - no checkboxes have been clicked at all.
2. Some medication checkboxes have been clicked.
3. Other - the user has entered some custom medication.

Right, so we can create the sealed class.

```Kotlin
sealed class MedicationResponse {
    class MedicationSet(val medicationSet: Set<Medication> = setOf()): MedicationResponse()
    class Other(val medication: String = ""): MedicationResponse()
    object None: MedicationResponse()
}
```

The medications selected are stored in a set, perfect since each can only appear once, and it will make it easy to add and remove them.

Now to set up the viewmodel so the response can be set.

```Kotlin
val _medicationResponse = MutableLiveData<MedicationResponse>(MedicationResponse.MedicationSet())

fun toggleMedication(medication: Medication) {
    when (val current = _medicationResponse.value) {
        // turn off no and populate set
        is MedicationResponse.None, is MedicationResponse.Other -> _medicationResponse.value = MedicationResponse.MedicationSet(setOf(medication))
        // a medication is already ticked, update the set appropriately
        is MedicationResponse.MedicationSet -> {
            val medicationSet = current.medicationSet.toMutableSet()
            if (medicationSet.contains(medication)) {
                medicationSet.remove(medication)
            } else {
                medicationSet.add(medication)
            }
            _medicationResponse.value = MedicationResponse.MedicationSet(medicationSet)
        }
    }
    _validMedicationResponse.value = FormValidationState.Unvalidated
}

fun toggleMedicationNone() {
    when (_medicationResponse.value) {
        // deselect none and return to empty set
        is MedicationResponse.None -> _medicationResponse.value = MedicationResponse.MedicationSet()
        // select none
        else -> _medicationResponse.value = MedicationResponse.None
    }
}

fun toggleMedicationOther() {
    if (_medicationResponse.value is MedicationResponse.Other) {
        // other checkbox is toggled off -> set to set of no medications
        _medicationResponse.value = MedicationResponse.MedicationSet()
    } else {
        // other checkbox is toggled on -> set to blank string
        _medicationResponse.value = MedicationResponse.Other()
    }
    _validMedicationResponse.value = FormValidationState.Unvalidated
}

fun setMedicationFromText(medication: String) {
    _medicationResponse.value = MedicationResponse.Other(medication)
    _validMedicationResponse.value = FormValidationState.Unvalidated
}
```

Great. Now to add the validation to the response class and the viewmodel.

```Kotlin
sealed class MedicationResponse() {
    ...        
    fun isValid(): ValidationResponse {
        return when (val response = this) {
            is None -> ValidationResponse.Valid
            is MedicationSet -> {
                if (response.medicationSet.isEmpty()) {
                    ValidationResponse.Invalid(R.string.medication_information_not_given)
                } else {
                    ValidationResponse.Valid
                }
            }
            is Other -> {
                if (response.medication.isBlank()) {
                    ValidationResponse.Invalid(R.string.medication_other_no_text)
                } else {
                    ValidationResponse.Valid
                }
            }
        }
    }
}
```

That is a marked improvement. Good work me.

## Generic Title

There is one final improvement to make. All those validation functions in the viewmodels look remarkably similar. In fact they are all identical, so let's replace them.

First we need a way to ensure that the validation is acting on a form response. Interface time.

```Kotlin
interface FormResponse {
    fun isValid(): ValidationResponse
}
```

Then lets update the form responses to implement the interface.

```Kotlin
sealed class NameResponse: FormResponse {
    ...
    override fun isValid(): ValidationResponse {
        ...
    }
}
```

Now lets modify the viewmodel validation to make use of generics, acting only on `FormResponse` implementations.

```Kotlin
fun <T: FormResponse> validateResponse(
    response: MutableLiveData<T>,
    validState: MutableLiveData<FormValidationState>,
    errors: MutableLiveData<List<Int>>
) {
    val newErrors = errors.value?.toMutableList() ?: mutableListOf()
    when (val validationResponse = response.value?.isValid()) {
        is ValidationResponse.Valid -> validState.value = FormValidationState.Valid
        // add the error that will be shown to the user to the list
        is ValidationResponse.Invalid -> {
            newErrors.add(validationResponse.reason)
            validState.value = FormValidationState.Invalid
        }
    }
    errors.value = newErrors
}
```

Bosh. Much better.
