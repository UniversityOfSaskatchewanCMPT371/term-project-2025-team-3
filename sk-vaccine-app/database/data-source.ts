import { Clinic } from '@/services/clinicDataService';
import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import ClinicEntity from './clinic-entity';
import { DataSource } from 'typeorm/browser';
/**
 * The object that manages the sqlite database with Typeorm.
 */
export const AppDataSource = new DataSource({
    type: 'expo',
    database: 'sk-vaccine-app.db',
    driver: require('expo-sqlite'),
    // all entities need to be added to this
    entities: [ClinicEntity],
    synchronize: true,

});



