import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  ValidationPipe
} from '@nestjs/common';

// inject UsersService supaya bisa akses logic CRUD dari service
import { UsersService } from './users.service';
// DTO ------------------------------------------------------
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// ----------------------------------------------------------

@Controller('users') // prefix semua route dengan /users
export class UsersController {

  // inject UsersService supaya bisa akses logic CRUD dari service
  constructor(private readonly userService: UsersService) { }

  @Get() // GET /users ------------------------------------------------------------------------------------------------------------
  // ambil semua user, bisa difilter pakai query param role (?role=ADMIN)
  findAll(@Query('role') role?: 'INTERN' | 'PROGRAMMER' | 'ADMIN') {
    return this.userService.findAll(role)
  }

  @Get(':id') // GET /users/:id -------------------------------------------------------------------------------------------------
  // ambil satu user berdasarkan id (param dari URL)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id) // +id untuk convert string ke number
  }

  @Post() // POST /users -------------------------------------------------------------------------------------------------------
  // buat user baru, sekarang masih return body mentah (belum panggil service)
  create(@Body(ValidationPipe) user: CreateUserDto) {
    return this.userService.create(user);
    // sebaiknya diganti: return this.userService.create(user);
  }

  @Patch(':id') // PATCH /users/:id ---------------------------------------------------------------------------------------------
  // update user berdasarkan id, sekarang masih dummy merge object
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) userUpdate: UpdateUserDto,
  ) {
    return this.userService.update(id, userUpdate);
    // sebaiknya diganti: return this.userService.update(+id, userUpdate);
  }

  @Delete(':id') // DELETE /users/:id -----------------------------------------------------------------------------------------
  // hapus user berdasarkan id, sudah pakai service
  DeleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
