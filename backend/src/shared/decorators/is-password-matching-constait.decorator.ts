// import { NewPasswordDto } from "@/src/modules/password/dto/new-password.dto";
// import { ValidatorConstraint, type ValidationArguments, type ValidatorConstraintInterface } from "class-validator";

// @ValidatorConstraint({ name: 'IsPasswordMatching', async: false })
// export class IsPasswordMatchingConstraint implements ValidatorConstraintInterface {
//     validate(passwordRepeat: string, args: ValidationArguments) {
//         const object = args.object as NewPasswordDto;
//         return object.password === passwordRepeat;
//     }

//     defaultMessage(args: ValidationArguments) {
//         return 'Пароли не совпадают';
//     }
// }