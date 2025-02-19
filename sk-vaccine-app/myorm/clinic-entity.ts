import { Clinic } from '@/services/clinicDataService';
import "reflect-metadata";
import { Column, Entity } from './decorators';
import BaseEntity from './base-entity';

// TODO make sure that the table is deleted and rebuilt if
// the fields do not match



@Entity()
export default class ClinicEntity extends BaseEntity implements Clinic {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ isNullable: true })
  latitude?: number;
  
  @Column({ isNullable: true })
  longitude?: number;
  
  @Column()
  serviceArea!: string;
  
  @Column()
  name!: string;
  
  @Column()
  address!: string;
  
  @Column()
  contactInfo!: string;
  
  @Column()
  hours!: string;
  
  @Column({isList: true})
  services!: string[];

  constructor(data?: Partial<Clinic> & {
    serviceArea: string,
    name: string,
    address: string,
    contactInfo: string,
    hours: string,
    services: Array<string>
  }) {
    super();
    if (data) {
      this.serviceArea = data.serviceArea;
      this.name = data.name;
      this.address = data.address;
      this.contactInfo = data.contactInfo;
      this.hours = data.hours;
      this.services = data.services;
      this.latitude = data.latitude;
      this.longitude = data.longitude;
    }
    
  }
}





function PrimaryGeneratedColumn(): (target: ClinicEntity, propertyKey: "id") => void {
  throw new Error('Function not implemented.');
}

