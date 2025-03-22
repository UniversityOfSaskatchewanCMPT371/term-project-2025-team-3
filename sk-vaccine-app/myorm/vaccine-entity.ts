import "reflect-metadata";
import { Column, Entity, PrimaryGeneratedColumn } from './decorators';
import BaseEntity from './base-entity';
import { Vaccine } from '@/interfaces/iVaccineData';
/*
const decorators = process.env.NODE_ENV === "test"
  ? require("./decorators-sqlite") // for testing environment
  : require("./decorators"); // for production environment

const { Column, Entity, PrimaryGeneratedColumn } = decorators;
const BaseEntity =
  process.env.NODE_ENV === "test"
    ? require("./base-entity-sqlite").default
    : require("./base-entity").default;
  */




@Entity()
export default class VaccineEntity extends BaseEntity implements Vaccine {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ tsType: String })
  vaccineName!: string;
  
  @Column({ tsType: Number, isUnique: true })
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
  
  constructor(data?: Partial<Vaccine>) {
    super();
    if (data) {
      this.vaccineName = data.vaccineName ?? '',
      this.productId = data.productId ?? 0,
      this.englishFormatId = data.englishFormatId ?? 0,
      this.frenchFormatId = data.frenchFormatId ?? 0,
      this.englishPDFFilename = data.englishPDFFilename ?? '',
      this.frenchPDFFilename = data.frenchPDFFilename ?? '',
      this.starting = data.starting ?? '',
      this.associatedDiseasesEnglish = data.associatedDiseasesEnglish ?? [],
      this.associatedDiseasesFrench = data.associatedDiseasesFrench ?? []
    }
    
  }
}