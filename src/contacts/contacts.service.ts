import { HttpStatus, Injectable } from '@nestjs/common';
import { SyncContactDto } from './dto/sync-contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from 'src/schemas/contacts.schema';

@Injectable()
export class ContactsService {
  constructor(
    @InjectModel(Contact.name) private contactModal: Model<Contact>,
  ) {}

  async sync(syncContactDto: SyncContactDto) {
    try {
      const contact = await this.contactModal.findOne({});
      if (contact) {
        await this.contactModal.findByIdAndUpdate(contact._id, syncContactDto);
      } else {
        await this.contactModal.create(syncContactDto);
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Đồng bộ thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async find() {
    try {
      return await this.contactModal.findOne();
    } catch (error) {
      throw error;
    }
  }
}
