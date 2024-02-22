import { Controller, Get, Post, Body } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { SyncContactDto } from './dto/sync-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  sync(@Body() syncContactDto: SyncContactDto) {
    return this.contactsService.sync(syncContactDto);
  }

  @Get()
  find() {
    return this.contactsService.find();
  }
}
