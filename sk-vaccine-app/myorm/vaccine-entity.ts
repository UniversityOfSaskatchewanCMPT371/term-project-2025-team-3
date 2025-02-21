import "reflect-metadata";
import { Column, Entity, PrimaryGeneratedColumn } from './decorators';
import BaseEntity from './base-entity';
import { Vaccine } from '@/interfaces/iVaccineData';

// TODO make sure that the table is deleted and rebuilt if
// the fields do not match



@Entity()
export default class VaccineEntity extends BaseEntity implements Vaccine {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ tsType: String })
    vaccineName!: string;
  
  @Column({ tsType: Number, unique: true })
  productId!: number;
  
  @Column({ tsType: Number })
  englishFormatId!: number;
  
  @Column({ tsType: Number })
  frenchFormatId!: number;

  @Column({ tsType: String, isNullable: true })
  englishPDFFilename!: string;

  @Column({ tsType: String, isNullable: true })
  frenchPDFFilename!: string;
  
  @Column({ tsType: String })
  starting!: string;
  
  @Column({ tsType: String, isList: true })
  associatedDiseasesEnglish!: string[];
  
  @Column({ tsType: String, isList: true })
  associatedDiseasesFrench!: string[];
  
  constructor(data?: Partial<Vaccine> & {
    vaccineName: string;
    productId: number;
    englishFormatId: number;
    frenchFormatId: number;
    englishPDFFilename: string;
    frenchPDFFilename: string;
    starting: string;
    associatedDiseasesEnglish: string[];
    associatedDiseasesFrench: string[];
  }) {
    super();
    if (data) {
      this.vaccineName = data.vaccineName,
      this.productId = data.productId,
      this.englishFormatId = data.englishFormatId,
      this.frenchFormatId = data.frenchFormatId,
      this.englishPDFFilename = data.englishPDFFilename,
      this.frenchPDFFilename = data.frenchPDFFilename,
      this.starting = data.starting,
      this.associatedDiseasesEnglish = data.associatedDiseasesEnglish,
      this.associatedDiseasesFrench = data.associatedDiseasesFrench
    }
    
  }
}