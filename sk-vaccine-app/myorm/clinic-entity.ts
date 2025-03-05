import { Clinic } from '@/services/clinicDataService';
import "reflect-metadata";
import { Column, Entity, PrimaryGeneratedColumn } from './decorators';
import BaseEntity from './base-entity';



@Entity({ immutable: true })
export default class ClinicEntity extends BaseEntity implements Clinic {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ tsType: Number, isNullable: true })
    latitude?: number;

    @Column({ tsType: Number, isNullable: true })
    longitude?: number;

    @Column({ tsType: String, isNullable: true })
    serviceArea: string;

    @Column({ tsType: String, isNullable: true })
    name: string;

    @Column({ tsType: String, isNullable: true })
    address: string;

    @Column({ tsType: String, isNullable: true })
    contactInfo: string;

    @Column({ tsType: String, isNullable: true })
    hours: string;

    @Column({ tsType: String, isList: true, isNullable: true })
    services: string[];

    constructor(data?: Partial<Clinic>) {
        super();
        if (data) {
            this.serviceArea = data.serviceArea ?? '';
            this.name = data.name ?? '';
            this.address = data.address ?? '';
            this.contactInfo = data.contactInfo ?? '';
            this.hours = data.hours ?? '';
            this.services = data.services || [];
            this.latitude = data.latitude;
            this.longitude = data.longitude;
        }
        else {
            this.serviceArea = '';
            this.name = '';
            this.address = '';
            this.contactInfo = '';
            this.hours = '';
            this.services = [];
        }
    }
}
