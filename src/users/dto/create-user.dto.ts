import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsEnum(["INTERN", "PROGRAMMER", "ADMIN"], {
        message: 'NOT intern, programmer not admin who are you ?'
    })
    role: "INTERN" | "PROGRAMMER" | "ADMIN";
    password: string;
}