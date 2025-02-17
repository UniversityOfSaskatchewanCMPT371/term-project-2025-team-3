import { Clinic } from '@/services/clinicDataService';
import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export default class ClinicEntity extends BaseEntity implements Clinic {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("real", { nullable: true })
  latitude?: number;
  
  @Column("real", { nullable: true })
  longitude?: number;
  
  @Column("text")
  serviceArea: string;
  
  @Column("text")
  name: string;
  
  @Column("text")
  address: string;
  
  @Column("text")
  contactInfo: string;
  
  @Column("text")
  hours: string;
  
  @Column("simple-array")
  services: string[];

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





