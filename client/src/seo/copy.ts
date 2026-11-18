import type { Language } from '../types/content';

export type StaticSeoCopy = { title: string; description: string };
export const seoCopy: Record<Language, Record<string, StaticSeoCopy>> = {
  "ua": {
    "/": {
      "title": "Vortex — CRM для магазинів автозапчастин і СТО",
      "description": "Керуйте товарами, замовленнями, фінансами й роботою СТО у Vortex. Каталоги запчастин, API-інтеграції, авторозбірка та сайт магазину в одній системі."
    },
    "/contact": {
      "title": "Контакти Vortex — консультація та демонстрація CRM",
      "description": "Зв’яжіться з командою Vortex щодо CRM для автозапчастин і СТО, розробки сайту чи ліцензії TecDoc. Контакти спеціалістів і форма заявки."
    },
    "/faq": {
      "title": "Питання та відповіді про Vortex | Довідка CRM",
      "description": "Відповіді на поширені запитання про Vortex: початок роботи, можливості CRM, тарифи та щоденний облік у магазині автозапчастин і СТО."
    },
    "/car-service": {
      "title": "Облік СТО та керування автосервісом | Vortex",
      "description": "Плануйте записи й роботу майстрів, ведіть історію авто, друкуйте документи та контролюйте фінанси СТО в системі Vortex."
    },
    "/websites": {
      "title": "Сайт магазину автозапчастин із CRM | Vortex",
      "description": "Замовте сайт для магазину автозапчастин або СТО, інтегрований із Vortex. Каталоги, ціни, залишки, кабінет клієнта та тарифні плани."
    },
    "/auto-dismantling": {
      "title": "Облік авторозбірки та вживаних запчастин | Vortex",
      "description": "Ведіть облік автомобілів на розборці, витрат і знятих деталей у Vortex. Статуси авто, склад запчастин і підбір за каталогом."
    },
    "/tecdoc-license": {
      "title": "Ліцензія TecDoc Web Catalog 3.0 | Vortex",
      "description": "Придбайте ліцензію TecDoc Web Catalog 3.0 у Vortex. Підбір автозапчастин, технічні дані TecRMI, можливості каталогу та консультація."
    },
    "/privacy-policy": {
      "title": "Політика конфіденційності | Vortex",
      "description": "Як Vortex обробляє дані відвідувачів сайту: заявки, контакти, геолокація, cookies, захист інформації та права щодо персональних даних."
    }
  },
  "en": {
    "/": {
      "title": "Vortex — CRM for auto parts stores and workshops",
      "description": "Manage inventory, orders, finances and workshop operations with Vortex. Parts catalogues, API integrations, vehicle dismantling and your store website in one system."
    },
    "/contact": {
      "title": "Contact Vortex — CRM advice and demonstrations",
      "description": "Contact the Vortex team about auto parts and workshop CRM, website development or TecDoc licences. Find our specialists and request a demonstration."
    },
    "/faq": {
      "title": "Vortex questions and answers | CRM help",
      "description": "Find answers about getting started with Vortex, CRM features, pricing and everyday inventory and workshop management for automotive businesses."
    },
    "/car-service": {
      "title": "Workshop management and service scheduling | Vortex",
      "description": "Schedule appointments and technicians, keep vehicle histories, print documents and manage workshop finances in Vortex."
    },
    "/websites": {
      "title": "Auto parts store websites connected to CRM | Vortex",
      "description": "Get an auto parts store or workshop website integrated with Vortex. Explore catalogues, prices, stock, customer accounts and website plans."
    },
    "/auto-dismantling": {
      "title": "Vehicle dismantling and used parts management | Vortex",
      "description": "Track dismantling vehicles, costs and removed parts in Vortex. Manage vehicle statuses, used parts inventory and catalogue-based parts selection."
    },
    "/tecdoc-license": {
      "title": "TecDoc Web Catalog 3.0 licence | Vortex",
      "description": "Buy a TecDoc Web Catalog 3.0 licence through Vortex. Explore parts selection, TecRMI technical data, catalogue features and assistance."
    },
    "/privacy-policy": {
      "title": "Privacy policy | Vortex",
      "description": "How Vortex handles website visitor data: enquiries, contact details, optional location, cookies, information security and personal data rights."
    }
  },
  "cz": {
    "/": {
      "title": "Vortex — CRM pro prodejny autodílů a autoservisy",
      "description": "Spravujte zboží, objednávky, finance a chod autoservisu ve Vortex. Katalogy dílů, API integrace, autovrakoviště a web prodejny v jednom systému."
    },
    "/contact": {
      "title": "Kontaktujte Vortex — konzultace a ukázka CRM",
      "description": "Kontaktujte tým Vortex ohledně CRM pro autodíly a autoservisy, tvorby webu nebo licence TecDoc. Kontakty na specialisty a formulář poptávky."
    },
    "/faq": {
      "title": "Otázky a odpovědi o Vortex | Nápověda CRM",
      "description": "Odpovědi na časté otázky o začátcích s Vortex, funkcích CRM, tarifech a každodenní evidenci v prodejně autodílů a autoservisu."
    },
    "/car-service": {
      "title": "Evidence a řízení autoservisu | Vortex",
      "description": "Plánujte zakázky a práci mechaniků, veďte historii vozidel, tiskněte dokumenty a sledujte finance autoservisu v systému Vortex."
    },
    "/websites": {
      "title": "Web prodejny autodílů propojený s CRM | Vortex",
      "description": "Pořiďte si web pro prodejnu autodílů nebo autoservis propojený s Vortex. Katalogy, ceny, skladové zásoby, zákaznický účet a cenové plány."
    },
    "/auto-dismantling": {
      "title": "Evidence autovrakoviště a použitých dílů | Vortex",
      "description": "Evidujte vozidla k demontáži, náklady a demontované díly ve Vortex. Stavy vozidel, sklad použitých dílů a výběr z katalogu."
    },
    "/tecdoc-license": {
      "title": "Licence TecDoc Web Catalog 3.0 | Vortex",
      "description": "Pořiďte si licenci TecDoc Web Catalog 3.0 přes Vortex. Výběr autodílů, technická data TecRMI, možnosti katalogu a konzultace."
    },
    "/privacy-policy": {
      "title": "Zásady ochrany osobních údajů | Vortex",
      "description": "Jak Vortex zpracovává údaje návštěvníků webu: poptávky, kontakty, dobrovolnou polohu, cookies, zabezpečení a práva na ochranu osobních údajů."
    }
  },
  "sk": {
    "/": {
      "title": "Vortex — CRM pre predajne autodielov a autoservisy",
      "description": "Spravujte tovar, objednávky, financie a chod autoservisu vo Vortex. Katalógy dielov, API integrácie, autovrakovisko a web predajne v jednom systéme."
    },
    "/contact": {
      "title": "Kontaktujte Vortex — konzultácia a ukážka CRM",
      "description": "Kontaktujte tím Vortex ohľadom CRM pre autodiely a autoservisy, tvorby webu alebo licencie TecDoc. Kontakty na špecialistov a formulár dopytu."
    },
    "/faq": {
      "title": "Otázky a odpovede o Vortex | Pomoc s CRM",
      "description": "Odpovede na časté otázky o začiatkoch s Vortex, funkciách CRM, tarifách a každodennej evidencii v predajni autodielov a autoservise."
    },
    "/car-service": {
      "title": "Evidencia a riadenie autoservisu | Vortex",
      "description": "Plánujte zákazky a prácu mechanikov, veďte históriu vozidiel, tlačte dokumenty a sledujte financie autoservisu v systéme Vortex."
    },
    "/websites": {
      "title": "Web predajne autodielov prepojený s CRM | Vortex",
      "description": "Získajte web pre predajňu autodielov alebo autoservis prepojený s Vortex. Katalógy, ceny, skladové zásoby, zákaznícky účet a cenové plány."
    },
    "/auto-dismantling": {
      "title": "Evidencia autovrakoviska a použitých dielov | Vortex",
      "description": "Evidujte vozidlá na demontáž, náklady a demontované diely vo Vortex. Stavy vozidiel, sklad použitých dielov a výber z katalógu."
    },
    "/tecdoc-license": {
      "title": "Licencia TecDoc Web Catalog 3.0 | Vortex",
      "description": "Získajte licenciu TecDoc Web Catalog 3.0 cez Vortex. Výber autodielov, technické údaje TecRMI, možnosti katalógu a konzultácia."
    },
    "/privacy-policy": {
      "title": "Zásady ochrany osobných údajov | Vortex",
      "description": "Ako Vortex spracúva údaje návštevníkov webu: dopyty, kontakty, dobrovoľnú polohu, cookies, zabezpečenie a práva na ochranu osobných údajov."
    }
  },
  "pl": {
    "/": {
      "title": "Vortex — CRM dla sklepów z częściami i warsztatów",
      "description": "Zarządzaj towarem, zamówieniami, finansami i pracą warsztatu w Vortex. Katalogi części, integracje API, demontaż aut i strona sklepu w jednym systemie."
    },
    "/contact": {
      "title": "Kontakt z Vortex — konsultacja i prezentacja CRM",
      "description": "Skontaktuj się z zespołem Vortex w sprawie CRM dla części i warsztatów, strony internetowej lub licencji TecDoc. Kontakty do specjalistów i formularz zgłoszenia."
    },
    "/faq": {
      "title": "Pytania i odpowiedzi o Vortex | Pomoc CRM",
      "description": "Odpowiedzi na pytania o rozpoczęcie pracy z Vortex, funkcje CRM, cennik i codzienną ewidencję w sklepie z częściami oraz warsztacie."
    },
    "/car-service": {
      "title": "Ewidencja i zarządzanie warsztatem | Vortex",
      "description": "Planuj wizyty i pracę mechaników, prowadź historię pojazdów, drukuj dokumenty i kontroluj finanse warsztatu w systemie Vortex."
    },
    "/websites": {
      "title": "Strona sklepu z częściami połączona z CRM | Vortex",
      "description": "Zamów stronę sklepu z częściami lub warsztatu zintegrowaną z Vortex. Katalogi, ceny, stany magazynowe, konto klienta i pakiety stron."
    },
    "/auto-dismantling": {
      "title": "Ewidencja demontażu aut i używanych części | Vortex",
      "description": "Ewidencjonuj pojazdy do demontażu, koszty i wymontowane części w Vortex. Statusy aut, magazyn części i dobór z katalogu."
    },
    "/tecdoc-license": {
      "title": "Licencja TecDoc Web Catalog 3.0 | Vortex",
      "description": "Kup licencję TecDoc Web Catalog 3.0 przez Vortex. Dobór części, dane techniczne TecRMI, możliwości katalogu i konsultacja."
    },
    "/privacy-policy": {
      "title": "Polityka prywatności | Vortex",
      "description": "Jak Vortex przetwarza dane odwiedzających: zgłoszenia, kontakty, dobrowolną lokalizację, cookies, zabezpieczenia i prawa dotyczące danych osobowych."
    }
  }
};
