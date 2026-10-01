import { LoginDto } from '../dto/login.dto';import { RegisterDto } from '../dto/register.dto';
export abstract class AuthAbstractService { abstract register(dto:RegisterDto):Promise<object>;abstract login(dto:LoginDto):Promise<object>; }
