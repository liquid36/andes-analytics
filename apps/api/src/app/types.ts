import { Moment } from 'moment';

export type Metrica = string;

export type ConceptId = string;

export type ConceptIds = ConceptId[];

export type Periodo = { start: Moment, end?: Moment };

export type PeriodoList = Periodo[];

export type Params = Record<string, any>;

export type GroupList = string[];
