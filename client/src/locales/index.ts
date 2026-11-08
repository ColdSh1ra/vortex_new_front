import ua from './ua.json';
import cz from './cz.json';
import sk from './sk.json';
import en from './en.json';
import pl from './pl.json';
import type { Language } from '../types/content';

export const interfaceTranslations: Record<Language, Record<string, string>> = { ua, cz, sk, en, pl };
