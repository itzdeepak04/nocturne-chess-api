import {IsString,IsUUID,MaxLength,MinLength} from 'class-validator';
export class MessageDto {
 @IsString() @MinLength(1) @MaxLength(500) text!:string;
 @IsUUID() clientId!:string;
}
export class SignalDto {
 @IsString() @MinLength(2) @MaxLength(32000) payload!:string;
 @IsUUID() clientId!:string;
}
