import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    // dummy data user disimpan di array (simulasi database)
    private users = [
        {
            id: 1,
            name: 'windy',
            email: 'windy@gmail.com',
            role: 'ADMIN',
            password: '123password',
        },
        {
            id: 2,
            name: 'budi',
            email: 'budi@gmail.com',
            role: 'INTERN',
            password: 'intern123',
        },
        {
            id: 3,
            name: 'sari',
            email: 'sari@gmail.com',
            role: 'PROGRAMMER',
            password: 'prog456',
        },
        {
            id: 4,
            name: 'andi',
            email: 'andi@gmail.com',
            role: 'ADMIN',
            password: 'admin789',
        },
        {
            id: 5,
            name: 'lina',
            email: 'lina@gmail.com',
            role: 'INTERN',
            password: 'intern999',
        },
    ];

    // GET semua user, bisa difilter berdasarkan role
    findAll(role?: 'INTERN' | 'PROGRAMMER' | 'ADMIN') {
        if (role) {
            return this.users.filter((user) => user.role === role);
        }
        return this.users;
    }

    // GET satu user berdasarkan id
    findOne(id: number) {
        const user = this.users.find((user) => user.id === id);
        return user;
    }

    // POST buat user baru
    // cari id terbesar, tambahkan +1, lalu push ke array
    create(user: { name: string; email: string; role: 'INTERN' | 'PROGRAMMER' | 'ADMIN'; password: string }) {
        const userByHighestId = [...this.users].sort((a, b) => b.id - a.id)
        const newUser = {
            id: userByHighestId[0].id + 1,
            ...user
        }
        this.users.push(newUser)
        return newUser
    }

    // PATCH update user berdasarkan id
    // merge data lama dengan data baru (updateUser)
    update(id: number, updateUser: { name?: string; email?: string; role?: 'INTERN' | 'PROGRAMMER' | 'ADMIN'; password?: string }) {
        this.users = this.users.map(user => {
            if (user.id === id) {
                return { ...user, ...updateUser }
            }
            return user
        })
        return this.findOne(id)
    }

    // DELETE hapus user berdasarkan id
    // return user yang dihapus
    delete(id: number) {
        const removeUser = this.findOne(id)
        this.users = this.users.filter(user => user.id !== id)
        return removeUser;
    }
}
