import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class LoginValidator {
    static passwordValidator(): ValidatorFn {
        return (currentControl: AbstractControl): ValidationErrors | null => {
            const isNotStrong = !LoginValidator.isPasswordStrong(
                currentControl.value,
            );

            if (isNotStrong) {
                return { passwordValidator: true };
            }
            return null;
        };
    }

    static emailValidator(previousEmail: string): ValidatorFn {
        return (currentControl: AbstractControl): ValidationErrors | null => {
            if (currentControl.value == previousEmail) {
                return { emailValidator: true };
            }
            return null;
        };
    }

    static isPasswordStrong(password: string): boolean {
        return (
            password.length > 7 // check min length
      && /\d/.test(password) // has number
      && /[A-Z]/.test(password) // has uppercase
      && /[a-z]/.test(password) // has lowercase
      && /[!@#$%^&*(),.?":{}|<>]/.test(password) // has special char
        );
    }
}