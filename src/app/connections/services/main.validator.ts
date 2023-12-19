import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class MainValidator {
    static groupNameValidator(): ValidatorFn {
        return (currentControl: AbstractControl): ValidationErrors | null => {
            const invalid = !MainValidator.isValid(
                currentControl.value,
            );

            if (invalid) {
                return { groupNameValidator: true };
            }
            return null;
        };
    }

    static isValid(name: string): boolean {
        let isValid = true;
        name.split('').forEach(letter => {
            if (!(/\d/.test(letter) || /[A-Z]/.test(letter) || /[a-z]/.test(letter))) {
                isValid = false;
                return;
            }
        })
        return isValid;
    }
}