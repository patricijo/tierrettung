export type AnimalCategory = 'wildtier' | 'haustier';
export type CountryCode = 'DE' | 'AT' | 'CH';

export interface TriageQuestion {
  id: string;
  question: string;
  yesVerdict: 'emergency' | 'observe' | 'safe';
  yesMessage: string;
  noMessage: string;
}

export interface AnimalProfile {
  id: string;
  name: string;
  subtitle: string;
  category: AnimalCategory;
  iconName: string;
  urgencyBadge: string;
  summary: string;
  triageQuestions: TriageQuestion[];
  selfProtection: string[];
  securingSteps: string[];
  firstAidSteps: string[];
  criticalNoGos: {
    title: string;
    reason: string;
  }[];
  transportTips: string[];
  specialistType: string;
}

export interface EmergencyHotline {
  id: string;
  name: string;
  country: CountryCode | 'DACH';
  regionLabel: string;
  phone: string;
  phoneDisplay: string;
  category: 'police_fire' | 'wildlife' | 'vet_emergency' | 'registry';
  animalIds?: string[]; // empty or undefined = applies to all
  availability: string;
  description: string;
  website?: string;
}

export interface CarKitItem {
  id: string;
  title: string;
  purpose: string;
  priority: 'essentiell' | 'empfohlen';
}

export const ANIMAL_PROFILES: AnimalProfile[] = [
  {
    id: 'igel',
    name: 'Igel',
    subtitle: 'Stacheliger Kulturfolger (Wildtier)',
    category: 'wildtier',
    iconName: 'Sparkles',
    urgencyBadge: 'Bei Tagaktivität & Fliegeneiern akut!',
    summary:
      'Igel sind dämmerungs- und nachtaktiv. Ein Igel, der tagsüber ungeschützt in der Sonne liegt, torkelt oder von Fliegen umschwirrt wird, schwebt in akuter Lebensgefahr.',
    triageQuestions: [
      {
        id: 'igel-day',
        question: 'Ist der Igel tagsüber unterwegs, liegt apathisch auf der Seite oder rollt sich bei Berührung kaum noch ein?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter Notfall! Gesunde Igel schlafen tagsüber versteckt. Tagaktivität deutet auf schwere Verletzung, Unterkühlung, Vergiftung oder hochgradigen Parasitenbefall hin.',
        noMessage:
          'Wenn der Igel in der Dämmerung oder nachts aktiv umherläuft, wohlgenährt aussieht (rundlich, keine Hungerfalte hinter dem Kopf) und sich sofort zur Kugel rollt, braucht er meist keine Hilfe.',
      },
      {
        id: 'igel-flies',
        question: 'Sind kleine weiße Reiskorn-ähnliche Gebilde (Fliegeneier), Maden oder offene Wunden zu sehen?',
        yesVerdict: 'emergency',
        yesMessage:
          'Höchste Lebensgefahr (Myiasis)! Maden fressen das Tier binnen weniger Stunden bei lebendigem Leib an. Sofort sichern und zu einer Igelstation oder Tierarztpraxis bringen!',
        noMessage:
          'Sehr gut. Prüfe dennoch vorsichtig, ob das Tier sich warm anfühlt oder im Spätherbst/Winter unter 500–600 g wiegt.',
      },
    ],
    selfProtection: [
      'Garten- oder Arbeitshandschuhe anziehen oder ein dickes Handtuch doppelt falten (spitze Stacheln sowie Flöhe, Zecken und Hautpilze sind häufig).',
      'Nach dem Kontakt Hände gründlich waschen und Haustiere strikt vom Fundigel fernhalten.',
    ],
    securingSteps: [
      'Hohen, luftdurchlässigen Karton (mind. 35–40 cm Randhöhe – Igel sind erstaunlich gute Kletterer!) vorbereiten.',
      'Kartonboden dick mit Zeitungspapier oder Küchenpapier auslegen; ein altes Handtuch oder Fleecetuch als Versteck hineinlegen (keine Fäden/Schlaufen, in denen Beinchen abschnüren können!).',
      'Igel vorsichtig mit beiden behandschuhten Händen von unten umfassen und in den Karton setzen.',
    ],
    firstAidSteps: [
      'Zuerst Temperatur prüfen (Bauchseite fühlen): Fühlt sich der Igel kühl an, eine handwarme Wärmflasche (oder mit warmem Wasser gefüllte PET-Flasche), eingewickelt in ein Handtuch, in eine Hälfte des Kartons legen – der Igel MUSS jederzeit von der Wärmequelle herunterkrabbeln können!',
      'Sichtbare Fliegeneier (weiße Päckchen in Stacheln, Augen, Ohren, After) sofort vorsichtig mit einer trockenen Zahnbürste, Pinzette oder einem Flohkamm abstreifen.',
      'Sobald der Igel aufgewärmt ist: Flache, kippsichere Schale mit frischem Wasser (oder lauwarmem Fencheltee) anbieten.',
      'Nur bei aufgewärmtem, stabilem Igel als Notlösung etwas ungewürztes Rührei (ohne Milch!) oder hochwertiges Katzen-Nassfutter (Pastete ohne Gelee/Sauce) anbieten.',
    ],
    criticalNoGos: [
      {
        title: 'NIEMALS Kuhmilch geben!',
        reason:
          'Igel sind laktoseintolerant. Kuhmilch verursacht schweren, meist tödlichen Durchfall und inneren Flüssigkeitsverlust.',
      },
      {
        title: 'Niemals unterkühlte Igel füttern!',
        reason:
          'Bei Untertemperatur arbeitet der Magen-Darm-Trakt nicht. Futter gärt im Magen und führt zum tödlichen Kreislaufkollaps. Immer ERST aufwärmen, DANN füttern!',
      },
      {
        title: 'Keine Floh-/Zeckensprays oder Spot-Ons für Hunde/Katzen!',
        reason:
          'Gängige Antiparasitika (z. B. Permethrin, Fipronil) wirken bei geschwächten Igeln als tödliches Nervengift.',
      },
      {
        title: 'Kein Obst, keine Rosinen, keine Nüsse!',
        reason:
          'Igel sind reine Insektenfresser – ihr kurzer Darm kann pflanzliche Kost nicht verwerten.',
      },
    ],
    transportTips: [
      'Karton im Fußraum hinter dem Beifahrersitz keilsicher abstellen.',
      'Radio ausschalten und Heizung/Klimaanlage nicht direkt auf den Karton richten.',
    ],
    specialistType: 'Igelstation / Wildtierhilfe / Kleintierpraxis',
  },
  {
    id: 'vogel',
    name: 'Vogel / Ästling / Mauersegler',
    subtitle: 'Singvögel, Jungvögel, Mauersegler & Greifvögel',
    category: 'wildtier',
    iconName: 'Bird',
    urgencyBadge: 'Katzenkontakt = sofort Antibiotikum!',
    summary:
      'Wichtigste Unterscheidung im Frühjahr/Sommer: Ist es ein gesunder „Ästling“ (befiederter Jungvogel, der am Boden von den Eltern gefüttert wird) oder ein verletzter Vogel bzw. Mauersegler?',
    triageQuestions: [
      {
        id: 'vogel-cat-window',
        question: 'Hatte der Vogel Kontakt mit einer Katze/Hund, ist gegen eine Glasscheibe geflogen, blutet oder lässt einen Flügel hängen?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter Notfall! Nach Katzenkontakt sterben Vögel durch Pasteurella-Bakterien im Katzenspeichel binnen 24–48 Std. ohne Antibiotikum – selbst wenn äußerlich keine Wunde sichtbar ist!',
        noMessage:
          'Prüfe nun, ob es sich um einen befiederten Jungvogel (Ästling) oder einen Mauersegler handelt.',
      },
      {
        id: 'vogel-aestling',
        question: 'Ist es ein voll befiederter Jungvogel (kurze Schwanzfedern), der munter wirkt, hüpft und nach seinen Eltern ruft (KEIN Mauersegler mit langen Sichelflügeln)?',
        yesVerdict: 'safe',
        yesMessage:
          'STOPP – Bitte NICHT mitnehmen! Das ist ein gesunder Ästling in der natürlichen Bettelflugphase. Die Eltern sind in der Nähe. Setze ihn nur bei unmittelbarer Gefahr (Straße/Katze) ins nächstgelegene dichte Gebüsch (max. 10–20 Meter entfernt).',
        noMessage:
          'Nackte/kaum befiederte Nestlinge am Boden, apathische Vögel mit aufgeplustertem Gefieder und geschlossenen Augen sowie JEDER Mauersegler am Boden benötigen sofortige Hilfe!',
      },
    ],
    selfProtection: [
      'Bei Singvögeln genügen saubere Hände oder ein leichtes Tuch.',
      'Bei Greifvögeln & Eulen: Achtung vor den extrem kräftigen Fängen (Krallen) – dicke Lederhandschuhe und schweres Handtuch nutzen!',
      'Bei Reihern, Störchen & Spechten: Schnabel sticht blitzschnell Richtung glänzender Augen – Kopf/Hals zuerst sichern und Abstand zum eigenen Gesicht halten!',
    ],
    securingSteps: [
      'Karton vorab vorbereiten: Mit einer Schere/Stift von innen nach außen kleine Luftlöcher stechen und den Boden mit Küchenpapier auslegen (KEIN Handtuch mit Frotteeschlaufen wegen Krallenverhedderung, KEIN Stroh/Heu wegen Schimmelpilzen!).',
      'Ein leichtes Tuch vorsichtig komplett über den Vogel legen (Dunkelheit nimmt sofort die Panik).',
      'Den Vogel sanft mit beiden Händen umfassen, sodass die Flügel natürlich am Körper anliegen, und in den Karton setzen. Karton sofort schließen.',
    ],
    firstAidSteps: [
      'Karton dunkel, ruhig und bei normaler Zimmertemperatur lagern (Stress allein kann bei Wildvögeln zum plötzlichen Herztod führen!).',
      'AUSNAHME GEHIRNERSCHÜTTERUNG (Scheibenanflug): Vogel absolut kühl und stockdunkel halten – KEINE Wärme zuführen!',
      'Bei unterkühlten, nackten Nestlingen (ohne Scheibenanflug!): Handwarme Wärmequelle von außen an eine Kartonwand legen.',
      'Umgehend Wildvogelhilfe, Mauerseglerklinik oder vogelkundige Tierarztpraxis kontaktieren.',
    ],
    criticalNoGos: [
      {
        title: 'NIEMALS Wasser oder Futter in den Schnabel träufeln!',
        reason:
          'Bei Vögeln liegt der Eingang zur Luftröhre direkt offen am Zungengrund. Eingeflößte Tropfen geraten sofort in die Lunge und führen zum Erstickungstod oder einer tödlichen Aspirationspneumonie.',
      },
      {
        title: 'Keine Wärme bei Anflugtrauma (Fensterscheibe / Auto)!',
        reason:
          'Wärme oder Rotlicht erweitert die Blutgefäße im Gehirn und führt bei Schädel-Hirn-Trauma zu tödlichen Hirnblutungen/Hirnödemen.',
      },
      {
        title: 'Kein Gitterkäfig (Vogelkäfig)!',
        reason:
          'Wildvögel flattern in Panik gegen die Gitterstäbe und zerstören sich dabei das überlebenswichtige Schwung- und Stoßgefieder.',
      },
      {
        title: 'Kein Brot, keine Milch, keine Regenwürmer an Mauersegler/Schwalben!',
        reason:
          'Mauersegler und Schwalben sind hochspezialisierte Luftinsektenjäger. Falsches Futter führt zu Organversagen und Gefiederschäden.',
      },
    ],
    transportTips: [
      'Karton während der Fahrt geschlossen lassen – nicht ständig hineinschauen („Schockruhe“ rettet Leben!).',
    ],
    specialistType: 'Wildvogelhilfe / Mauersegler-Pflegestelle / Vogelkundiger Tierarzt',
  },
  {
    id: 'eichhoernchen',
    name: 'Eichhörnchen',
    subtitle: 'Baumbewohner & Kletterkünstler (Wildtier)',
    category: 'wildtier',
    iconName: 'Squirrel',
    urgencyBadge: 'Anhängliche Jungtiere = Waisentier!',
    summary:
      'Verwaiste Eichhörnchen-Junge zeigen ein einzigartiges Verhalten: Wenn ihre Mutter nach 24–48 Stunden nicht in den Kobel zurückkehrt, steigen sie vom Baum und laufen gezielt Menschen hinterher!',
    triageQuestions: [
      {
        id: 'squirrel-follow',
        question: 'Läuft dir ein junges Eichhörnchen aktiv hinterher, klettert an deinem Hosenbein hoch oder liegt es reglos/blutend unter einem Baum?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter Notfall! Ein Jungtier, das Menschen aktiv aufsucht, bittet verzweifelt um Hilfe und ist dehydriert/verwaist. Sofort sichern und wärmen!',
        noMessage:
          'Wenn ein erwachsenes Hörnchen flink klettert oder kurz am Boden ruht und bei Annäherung sofort auf den Baum flüchtet, ist alles in Ordnung.',
      },
    ],
    selfProtection: [
      'Erwachsene oder unter Schock stehende Eichhörnchen haben extrem scharfe, lange Nagezähne, die tiefe Bisswunden verursachen können.',
      'Immer feste Handschuhe oder ein dickes Handtuch/Fleecemütze zum Aufnehmen verwenden.',
    ],
    securingSteps: [
      'Für Jungtiere eignet sich eine weiche Fleecemütze, ein Kuschelschal oder ein mit weichen Tüchern ausgepolsterter Karton mit Luftlöchern.',
      'Fundort im Umkreis von 10–15 Metern unbedingt nach Geschwistern absuchen! Oft sind mehrere Jungtiere aus demselben Kobel abgestürzt oder verwaist.',
    ],
    firstAidSteps: [
      'Sanfte Wärmequelle anbieten (in ein Handtuch gewickelte Wärmflasche oder körperwarme PET-Flasche; dem Tier Platz lassen, um wegzukrabbeln).',
      'Nur bei Schädel-Hirn-Trauma (Nasenbluten, Kopfschiefhaltung, Krampfen nach Absturz): KEINE direkte Hitze an den Kopf legen!',
      'Sofort den bundesweiten Eichhörnchen-Notruf oder die nächste Wildtierstation anrufen.',
    ],
    criticalNoGos: [
      {
        title: 'Keine Kuhmilch, Kondensmilch oder Babynahrung einflößen!',
        reason:
          'Falsche Milch führt bei Hörnchenbabys zu lebensbedrohlichen Blähungen und Durchfall; falsches Einflößen führt zu Lungenentzündung.',
      },
      {
        title: 'Keine Erdnüsse (besonders in der Schale)!',
        reason:
          'Erdnüsse sind häufig mit unsichtbaren Schimmelpilzsporen (Aspergillus) belastet, die für geschwächte Hörnchen tödlich sind.',
      },
    ],
    transportTips: [
      'Karton fest verschließen – ein sich plötzlich erholendes Eichhörnchen im fahrenden Auto ist ein enormes Unfallrisiko!',
    ],
    specialistType: 'Eichhörnchen-Notruf / Eichhörnchenhilfe',
  },
  {
    id: 'reh_wild',
    name: 'Rehkitz / Wildtier am Straßenrand',
    subtitle: 'Reh, Hirsch, Wildschwein, Fuchs, Hase, Dachs',
    category: 'wildtier',
    iconName: 'Trees',
    urgencyBadge: 'NICHT mit bloßen Händen anfassen!',
    summary:
      'Bei Schalenwild (Reh, Hirsch, Wildschwein) und Feldhasen gelten strenge Verhaltensregeln: Allein liegende Jungtiere sind fast nie verwaist, und verletzte Wildtiere dürfen nicht einfach ins Auto geladen werden!',
    triageQuestions: [
      {
        id: 'reh-fawn',
        question: 'Liegt ein einzelnes Rehkitz oder ein kleiner Feldhase ruhig zusammengerollt im hohen Gras / Wald (ohne sichtbare Wunden)?',
        yesVerdict: 'safe',
        yesMessage:
          'HALT – Bitte sofort auf Abstand gehen! Rehkitze und junge Feldhasen werden von der Mutter absichtlich allein abgelegt, um keine Fressfeinde anzulocken. Die Mutter kommt nur wenige Male am Tag zum Säugen und wartet oft in Sichtweite, bis du weggehst!',
        noMessage:
          'Liegt das Tier auf der Fahrbahn, ist es angefahren, schwer verletzt, laut klagend oder droht unmittelbar eine Wiesenmahd? Dann folge den Sicherungsschritten.',
      },
      {
        id: 'reh-collision',
        question: 'Handelt es sich um einen Wildunfall im Straßenverkehr oder ein verletztes größeres Wildtier (Reh, Wildschwein, Fuchs)?',
        yesVerdict: 'emergency',
        yesMessage:
          'Unfallstelle sofort absichern (Warnblinker, Warnweste, Warndreieck) und umgehend die Polizei (110 / 112 / 117) rufen! Die Polizei verständigt den zuständigen Jagdpächter/Wildhüter.',
        noMessage:
          'Halte dennoch weiten Abstand, fotografiere oder notiere den genauen Standort und kontaktiere die örtliche Wildtierrettung oder Polizei.',
      },
    ],
    selfProtection: [
      'EIGENSCHUTZ ZUERST: Auf Straßen immer zuerst Warnblinker einschalten, Warnweste anziehen und Warndreieck (100–200 m Abstand) aufstellen!',
      'Verletzte Wildschweine, Rehböcke (scharfes Gehörn & spitze Schalen/Hufe) und Füchse sind in Todesangst extrem wehrhaft – mindestens 10–15 Meter Abstand halten!',
    ],
    securingSteps: [
      'Unfallort exakt bestimmen: Nutze die Funktion „Fundort teilen“ in dieser App oder lies die Nummer und Pfeilrichtung am nächsten Straßen-Leitpfosten ab.',
      'Polizei anrufen: Durchgeben, um welche Tierart es sich handelt, ob das Tier noch lebt, auf der Fahrbahn liegt oder in welche Richtung es geflüchtet ist.',
      'AUSNAHME REHKITZ AUF FAHRBAHN / VOR MÄHWERK: Nur im äußersten Notfall mit Handschuhen UND zwei großen Büscheln ausgerissenem Gras (niemals direkter Haut- oder Kleidungskontakt!) vorsichtig an den sicheren Waldrand setzen.',
    ],
    firstAidSteps: [
      'Ruhig in sicherer Entfernung warten, bis Polizei oder Jagdpächter eintreffen.',
      'Schaulustige und Hunde strikt fernhalten, damit das verletzte Tier keinen zusätzlichen Panikschock erleidet.',
      'Ist das Tier in den Wald geflüchtet: Stelle am Straßenrand markieren (z. B. Zweig oder Taschentuch an Leitpfosten binden), damit der Nachsuchehund die Fährte aufnehmen kann.',
    ],
    criticalNoGos: [
      {
        title: 'Rehkitze & Feldhasen NIEMALS mit bloßen Händen berühren!',
        reason:
          'Menschlicher Geruch am Jungtier führt dazu, dass die Mutter (Ricke) ihr Kitz verstößt und es qualvoll verhungert.',
      },
      {
        title: 'Verletztes Jagdwild NIEMALS ins eigene Auto einladen!',
        reason:
          'Das Mitnehmen von dem Jagdrecht unterliegenden Tieren erfüllt den Straftatbestand der Jagdwilderei (§ 292 StGB) und bringt dich bei einem plötzlich ausschlagenden Reh im Fahrzeug in Lebensgefahr!',
      },
      {
        title: 'Verletztem Wild nicht in den Wald nachlaufen!',
        reason:
          'Du treibst das unter Schock stehende Tier nur weiter weg und zerstörst die Geruchsfährte für den ausgebildeten Schweißhund.',
      },
    ],
    transportTips: [
      'Kein eigener Transport bei Reh, Hirsch oder Wildschwein – immer auf Polizei / Jagdausübungsberechtigten / offizielle Tierrettung warten!',
    ],
    specialistType: 'Polizei (110) / Zuständiger Jagdpächter / Kitzrettung',
  },
  {
    id: 'fledermaus',
    name: 'Fledermaus',
    subtitle: 'Streng geschützter Nachtjäger (Wildtier)',
    category: 'wildtier',
    iconName: 'Moon',
    urgencyBadge: 'Nur mit festen Handschuhen sichern!',
    summary:
      'Eine Fledermaus, die tagsüber sichtbar am Boden, an einer Hauswand in Bodennähe oder im Wohnraum sitzt, braucht immer fachkundige Hilfe.',
    triageQuestions: [
      {
        id: 'bat-day',
        question: 'Liegt die Fledermaus am Boden, hängt tagsüber ungeschützt in Griffhöhe oder hatte sie Kontakt mit einer Katze?',
        yesVerdict: 'emergency',
        yesMessage:
          'Notfall! Gesunde Fledermäuse verbringen den Tag versteckt in Spalten oder Baumhöhlen. Am Boden sind sie schutzlos Katzen, Krähen und Ameisen ausgeliefert.',
        noMessage:
          'Hat sich eine Fledermaus abends nur in ein Zimmer verflogen? Licht ausschalten, Vorhänge beiseiteschieben, Fenster weit öffnen und das Zimmer verlassen – meist fliegt sie von selbst hinaus.',
      },
    ],
    selfProtection: [
      'WICHTIG: Fledermäuse NIEMALS mit bloßen Händen anfassen! Sie haben nadelspitze Zähne und können in seltenen Fällen das Europäische Fledermaustollwut-Virus (EBLV) übertragen.',
      'Immer feste Leder-/Arbeitshandschuhe tragen oder ein Glas/Becher darüberstülpen und ein Stück feste Pappe darunterschieben.',
    ],
    securingSteps: [
      'Ausbruchsichere Schachtel (z. B. Schuhkarton oder Schraubglas mit gelochtem Deckel) vorbereiten.',
      'ACHTUNG AUSBRUCHSGEFAHR: Zwergfledermäuse wiegen nur 4–5 Gramm und quetschen sich durch Schlitze von nur 5 Millimetern! Kartonritzen nach dem Einsetzen mit Klebeband sichern.',
      'Ein grobes Küchentuch oder mehrfach gefaltetes Küchenpapier in die Schachtel hängen, woran sich die Fledermaus krallen und verstecken kann.',
    ],
    firstAidSteps: [
      'Einen sehr flachen Flaschendeckel (z. B. Marmeladenglasdeckel) mit wenigen Tropfen Wasser in eine Ecke stellen (keine tiefe Schale – geschwächte Tiere ertrinken darin!).',
      'Schachtel an einen ruhigen, kühlen bis zimmerwarmen Ort (nicht in die Sonne, nicht auf die Heizung!) stellen.',
      'Sofort die Fledermaus-Notrufnummer (NABU / Koordinationsstellen für Fledermausschutz) anrufen.',
    ],
    criticalNoGos: [
      {
        title: 'Niemals mit bloßen Händen greifen!',
        reason:
          'Kommt es zu einem Biss oder Kratzer mit bloßer Haut, ist vorsorglich eine medizinische Tollwut-Postexpositionsprophylaxe (Impfung beim Hausarzt/Krankenhaus) erforderlich.',
      },
      {
        title: 'Fledermaus NIEMALS zum „Flugtest“ in die Luft werfen!',
        reason:
          'Geschwächte oder unterkühlte Tiere stürzen ungebremst ab und ziehen sich dabei tödliche Knochenbrüche zu.',
      },
    ],
    transportTips: [
      'Alle Kanten des Kartons mit Klebeband abkleben und nur kleine (max. 2–3 mm) Luftlöcher mit einem Kugelschreiber stechen.',
    ],
    specialistType: 'Fledermausschutz-Notruf / NABU / LBV / Fledermaus-Nottelefon',
  },
  {
    id: 'hund',
    name: 'Hund',
    subtitle: 'Verkehrsunfall, Hitzschlag oder Fundhund (Haustier)',
    category: 'haustier',
    iconName: 'Dog',
    urgencyBadge: 'Eigenschutz: Schmerzbedingtes Schnappen!',
    summary:
      'Verletzte oder entlaufene Hunde stehen oft unter massivem Schock. Auch der friedlichste Hund kann bei starken Schmerzen aus reinem Reflex zubeißen.',
    triageQuestions: [
      {
        id: 'dog-emergency',
        question: 'Blutet der Hund stark, ist er nach einem Unfall nicht gehfähig, bewusstlos oder in einem überhitzten Auto eingeschlossen?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter tiermedizinischer Notfall! Bei Hund im heißen Auto mit Symptomen (starkes Hecheln, Taumeln, glasiger Blick, Bewusstlosigkeit) sofort Polizei/Feuerwehr (110/112) rufen!',
        noMessage:
          'Handelt es sich um einen unverletzten, herrenlosen Hund? Prüfe vorsichtig, ob eine Steuermarke/TASSO-Marke am Halsband hängt, und informiere Polizei oder das örtliche Tierheim.',
      },
    ],
    selfProtection: [
      'Langsam und leicht seitlich nähern, in die Hocke gehen, ruhig sprechen, direktem Blickkontakt ausweichen.',
      'Bei schmerzhaften Verletzungen vor dem Anheben eine provisorische Maulschlinge (aus einer Mullbinde, Krawatte oder weichen Leine) anlegen.',
      'AUSNAHME MAULSCHLINGE: Niemals eine Maulschlinge anlegen bei Atemnot, Erbrechen, Bewusstlosigkeit, Nasen-/Maulverletzungen oder kurzschnäuzigen Rassen (Mops, Bulldogge)!',
    ],
    securingSteps: [
      'Unfallstelle sichern (Warnblinker, Warndreieck). Hund sofort anleinen (notfalls Gürtel oder Abschleppseil als improvisierte Leine nutzen), damit er im Schock nicht vor das nächste Auto rennt.',
      'Zum Anheben größerer Hunde: Eine Decke oder Jacke als Tragetuch unter Brustkorb und Becken durchziehen und zu zweit anheben (Wirbelsäule gerade halten!).',
    ],
    firstAidSteps: [
      'Bewusstlosigkeit: Hund in stabile Seitenlage (auf die RECHTE Körperseite) legen, Kopf leicht überstrecken, Zunge seitlich aus dem Fang ziehen, damit die Atemwege frei bleiben.',
      'Starke Blutung: Sauberes Tuch/Kompresse fest auf die Wunde drücken (Druckverband).',
      'Hitzschlag: Hund sofort in den Schatten bringen, Pfoten und Beine von unten nach oben langsam mit handkühlem (nicht eiskaltem!) Wasser befeuchten und lauwarmes Wasser zum Trinken anbieten.',
      'Vor Abfahrt immer telefonisch in der Tierklinik anrufen, damit das Notfallteam vorbereitet ist!',
    ],
    criticalNoGos: [
      {
        title: 'Bei Hitzschlag NIEMALS eiskaltes Wasser über den Hund gießen!',
        reason:
          'Eiskaltes Wasser verengt schlagartig die Blutgefäße der Haut – die Hitze bleibt im Körperkern gefangen und es kommt zum tödlichen Kreislaufschock.',
      },
      {
        title: 'Keine nassen Handtücher dauerhaft über den Rücken legen!',
        reason:
          'Unter einem nassen Tuch staut sich die Körperwärme binnen kürzester Zeit wie in einer Sauna.',
      },
      {
        title: 'Keine menschlichen Schmerzmittel (Ibuprofen, Paracetamol, Diclofenac)!',
        reason:
          'Menschliche Schmerzmittel führen beim Hund zu schwerem Nieren-/Leberversagen und Magenblutungen.',
      },
    ],
    transportTips: [
      'Auf einer Decke im Kofferraum/Rückbank transportieren; eine Begleitperson sollte das Tier beruhigen und sichern.',
    ],
    specialistType: 'Tierklinik (24h Notdienst) / Tierrettung / Tierheim / Polizei',
  },
  {
    id: 'katze',
    name: 'Katze',
    subtitle: 'Verkehrsunfall, Kippfenster-Syndrom oder Fundkatze',
    category: 'haustier',
    iconName: 'Cat',
    urgencyBadge: 'Kippfenster = absolute Lebensgefahr!',
    summary:
      'Verletzte Katzen geraten leicht in Panik und neigen bei Stress zu lebensbedrohlichem Kreislaufversagen oder Lungenödemen (Maulatmung/Hecheln bei Katzen = Alarmstufe Rot!).',
    triageQuestions: [
      {
        id: 'cat-emergency',
        question: 'Ist die Katze verletzt, hechelt mit offenem Maul, zieht die Hinterbeine nach oder hing in einem gekippten Fenster?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter Notfall! Besonders nach einem Kippfenster-Unfall oder wenn eine Katze durch das offene Maul atmet (hechelt), zählt jede Minute – sofort in die nächste Tierklinik!',
        noMessage:
          'Ist die Katze wohlgenährt, gepflegt und zutraulich im Wohngebiet unterwegs? Bitte NICHT einfach einpacken oder anfüttern – es handelt sich fast immer um einen regulären Freigänger mit Zuhause!',
      },
    ],
    selfProtection: [
      'Verletzte Katzen schlagen blitzschnell mit Krallen und Zähnen um sich. Katzenbisse beim Menschen übertragen tief ins Gewebe Bakterien und müssen ärztlich versorgt werden!',
      'Immer die „Handtuch-Burrito-Technik“ nutzen: Ein großes, dickes Handtuch oder eine Decke komplett über die Katze werfen und sie mitsamt Tuch sanft, aber bestimmt umfassen.',
    ],
    securingSteps: [
      'Transportbox (oder stabilen, hohen Karton) so aufstellen, dass die Öffnung nach OBEN zeigt – eine Katze lässt sich im Handtuch viel sicherer von oben hineinlegen als von vorne hineinschieben.',
      'Box sofort sicher verriegeln (bei Transportboxen immer ALLE Verschlussclips prüfen und Box von unten stützen, nicht nur am Griff tragen!).',
    ],
    firstAidSteps: [
      'KIPPFENSTER-NOTFALL: Katze vorsichtig von unten am Brustkorb und Bauch abstützen und behutsam nach oben aus dem Spalt heben. Hinterbeine NICHT massieren, sondern sofort in die Tierklinik fahren!',
      'Bei Maulatmung / Hecheln: Absoluter Ruhemodus! Box mit einem dünnen Tuch abdunkeln, gut belüften und jedes unnötige Anfassen vermeiden.',
      'Tierklinik während der Anfahrt telefonisch vorwarnen.',
    ],
    criticalNoGos: [
      {
        title: 'Nach Kippfenster-Befreiung NIEMALS die Hinterbeine massieren!',
        reason:
          'Durch das Abklemmen der Bauchschlagader sammeln sich giftige Stoffwechselprodukte und Kalium in der Hinterhand. Massieren schwemmt diese schlagartig zum Herzen und löst einen sofortigen Herzstillstand aus.',
      },
      {
        title: 'Niemals Paracetamol, Aspirin oder Teebaumöl anwenden!',
        reason:
          'Katzen fehlen bestimmte Leberenzyme – schon ein Bruchteil einer Paracetamol-Tablette ist für eine Katze tödlich.',
      },
    ],
    transportTips: [
      'Transportbox mit dem Sicherheitsgurt anschnallen und ein Tuch darüberlegen, damit die Katze keine optischen Reize hat.',
    ],
    specialistType: 'Tierklinik (24h Notdienst) / Tierrettung / Tierheim',
  },
  {
    id: 'amphibien',
    name: 'Amphibien & Reptilien',
    subtitle: 'Erdkröte, Frosch, Feuersalamander, Blindschleiche, Ringelnatter',
    category: 'wildtier',
    iconName: 'Bug',
    urgencyBadge: 'Hände vorher mit klarem Wasser befeuchten!',
    summary:
      'Amphibien (Kröten, Frösche, Molche, Salamander) atmen und trinken über ihre dünne, schleimbedeckte Haut. Trockene Hände, Seifenreste oder Desinfektionsmittel sind für sie lebensgefährlich!',
    triageQuestions: [
      {
        id: 'amphib-check',
        question: 'Ist das Tier verletzt (z. B. Rasenmäher, Katze, Auto), ausgetrocknet oder in einem Kellerlichtschacht gefangen?',
        yesVerdict: 'emergency',
        yesMessage:
          'Hilfe erforderlich! Unverletzte Tiere aus einem Lichtschacht können vorsichtig mit angefeuchteten Händen in den schattigen Garten/Wald gesetzt werden; verletzte Tiere müssen kühl und feucht gesichert werden.',
        noMessage:
          'Sitzt eine Kröte bei Regenwetter auf einer Straße? Trage sie mit feuchten Händen oder Blättern in ihre Blick-/Laufrichtung auf die andere Straßenseite.',
      },
    ],
    selfProtection: [
      'Erdkröten und Feuersalamander sondern bei Stress ein bitteres Hautsekret ab, das stark auf menschlichen Schleimhäuten brennt – nach dem Kontakt nicht in die Augen fassen und Hände gründlich mit Wasser waschen!',
      'Bei Schlangen: Blindschleichen (glänzend, kupferfarben) und Ringelnattern (gelbe „Halbmonde“ hinter dem Kopf) sind völlig ungiftig. Bei Kreuzottern (deutliches dunkles Zickzackband auf dem Rücken, senkrechte Pupille) Abstand halten!',
    ],
    securingSteps: [
      'WICHTIG VOR DEM ANFASSEN: Hände mit sauberem Wasser (oder feuchter Erde/Laub) anfeuchten oder nitrilfreie Einmalhandschuhe anfeuchten.',
      'Saubere Kunststoffbox oder Karton mit Luftlöchern vorbereiten und den Boden mit gut angefeuchtetem (nicht schwimmendem!), unbedrucktem Küchenpapier auslegen.',
    ],
    firstAidSteps: [
      'KÜHL UND SCHATTIG LAGERN (ideal: 10–18 °C)! Als wechselwarme Tiere haben Amphibien im Kühlen einen stark verlangsamten Stoffwechsel und überstehen Verletzungen deutlich besser.',
      'Ein zweites, leicht angefeuchtetes Blatt Küchenpapier locker als Versteck über das Tier legen, damit es nicht austrocknet.',
      'Wildtierstation oder amphibienkundige Tierarztpraxis kontaktieren.',
    ],
    criticalNoGos: [
      {
        title: 'NIEMALS mit Händedesinfektionsmittel, Seife oder Sonnencreme anfassen!',
        reason:
          'Alkohol und Chemikalien dringen sofort durch die dünne Amphibienhaut in den Blutkreislauf ein und führen zu einem qualvollen Vergiftungstod.',
      },
      {
        title: 'NIEMALS auf eine Wärmflasche oder in die Sonne stellen!',
        reason:
          'Anders als Säugetiere und Vögel dürfen Amphibien niemals gewärmt werden – sie überhitzen und vertrocknen binnen kürzester Zeit.',
      },
      {
        title: 'Eidechsen & Blindschleichen niemals am Schwanz greifen!',
        reason:
          'Sie werfen bei Gefahr ihren Schwanz ab (Autotomie), was dem Tier wichtige Energiereserven raubt.',
      },
    ],
    transportTips: [
      'Box im kühlsten Bereich des Fahrzeugs transportieren, Heizung im Fußraum ausschalten.',
    ],
    specialistType: 'Wildtierstation / Reptilien- & Amphibienauffangstation / NABU',
  },
  {
    id: 'hase_kaninchen',
    name: 'Hase / Kaninchen',
    subtitle: 'Feldhase, Wildkaninchen oder Fund-Heimkaninchen',
    category: 'wildtier',
    iconName: 'Rabbit',
    urgencyBadge: 'Feldhasen-Junge im Gras NIEMALS anfassen!',
    summary:
      'Achtung Verwechslungsgefahr: Junge Feldhasen sitzen ab Geburt voll behaart und mit offenen Augen allein im Gras – sie sind NICHT verwaist! Wildkaninchen-Babys hingegen sind nackt/blind in Erdbauten; bunte oder schlappohrige Kaninchen sind ausgesetzte Haustiere.',
    triageQuestions: [
      {
        id: 'hare-sitting',
        question: 'Sitzt ein einzelnes, braun behaartes Jungtier mit offenen Augen ruhig geduckt im Gras/Feld (ohne sichtbare Verletzung)?',
        yesVerdict: 'safe',
        yesMessage:
          'STOPP – Sofort auf Abstand gehen und NICHT berühren! Das ist ein gesunder junger Feldhase in seiner „Sasse“. Die Häsin (Mutter) kommt zum Schutz vor Feinden nur 1–2 Mal nachts für wenige Minuten zum Säugen!',
        noMessage:
          'Prüfe nun, ob das Tier verletzt ist, die Augen noch geschlossen hat (Wildkaninchen-Nestling) oder ein ausgesetztes Hauskaninchen ist.',
      },
      {
        id: 'rabbit-injured',
        question: 'Hatte das Tier Kontakt mit einer Katze/Hund/Auto, liegt auf der Seite, ist noch blind/nackt ODER ist es ein buntes/schlappohriges Hauskaninchen?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter Notfall! Verletzte Hasen/Kaninchen sowie im Freien gefundene Hauskaninchen (Farbkaninchen, Widder mit Schlappohren) brauchen sofortige Sicherung!',
        noMessage:
          'Beobachte das Tier nur aus sehr großer Distanz (> 30 Meter). Bei Feldhasen gilt zudem das Jagdrecht (§ 292 StGB).',
      },
    ],
    selfProtection: [
      'Hasen und Kaninchen haben extrem kräftige Hinterläufe mit scharfen Krallen – beim Strampeln in Panik können sie sich selbst die Wirbelsäule brechen!',
      'Feldhasen unterliegen dem Jagdrecht (§ 292 StGB) – vor einer Entnahme verletzter Feldhasen immer Polizei oder Wildtierstation verständigen.',
    ],
    securingSteps: [
      'Dunklen, gut belüfteten Karton mit rutschfester Unterlage (Handtuch/Küchenpapier) direkt neben dem Tier bereitstellen.',
      'Ein leichtes Handtuch komplett über das Tier legen (sofortige Abdunkelung verhindert Paniksprünge und Kreislaufkollaps).',
      'Mit einer Hand den Brustkorb, mit der anderen Hand zwingend das Hinterteil/die Hinterläufe von unten abstützen und behutsam in den Karton setzen.',
    ],
    firstAidSteps: [
      'ABSOLUTE RUHE: Hasenartige sind extrem stressanfällig – schon laute Geräusche oder Hundegebell können zum plötzlichen Herztod führen!',
      'Bei Unterkühlung (kühle Ohren): Eine handwarme, in ein Tuch gewickelte Wärmequelle an eine Seite des Kartons legen (Ausweichmöglichkeit lassen!).',
      'Nur bei erwachsenen, wachen Haus-/Wildkaninchen: Etwas frisches Wiesengras, Löwenzahn oder Heu und ein flaches Schälchen Wasser in den Karton stellen.',
      'Sofort Wildtierhilfe (bei Wildkaninchen/Feldhase) bzw. Tierheim/Tierklinik (bei Hauskaninchen) kontaktieren.',
    ],
    criticalNoGos: [
      {
        title: 'Junge Feldhasen im Gras NIEMALS mit bloßen Händen anfassen!',
        reason:
          'Sobald menschlicher Geruch am Jungtier haftet, verstößt die Häsin ihr Junges. Zudem überleben handaufgezogene Feldhasen in menschlicher Obhut nur selten.',
      },
      {
        title: 'Niemals im Nackenfell packen oder auf den Rücken drehen!',
        reason:
          'Der Nackengriff löst Todesangst aus; ein kräftiger Tritt der Hinterläufe ins Leere führt oft zu einem tödlichen Wirbelsäulenbruch.',
      },
      {
        title: 'Keine Kuhmilch, kein Brot, kein Kohl oder nasser Klee!',
        reason:
          'Hasen und Kaninchen haben einen empfindlichen Stopfmagen – Kuhmilch und falsches Futter führen zu tödlicher Aufgasung (Trommelsucht).',
      },
    ],
    transportTips: [
      'Karton komplett abgedunkelt und erschütterungsfrei im Fußraum transportieren; absolute Stille im Fahrzeug.',
    ],
    specialistType: 'Wildtierstation / Kaninchenhilfe / Tierheim / Polizei (bei Feldhase)',
  },
  {
    id: 'wasservogel',
    name: 'Wasservogel (Schwan, Ente, Gans)',
    subtitle: 'Schwan, Stockente, Wildgans, Blesshuhn, Haubentaucher',
    category: 'wildtier',
    iconName: 'Waves',
    urgencyBadge: 'Niemals an verschluckter Angelschnur ziehen!',
    summary:
      'Wasservögel geraten besonders häufig durch weggeworfene Angelschnüre, Angelhaken, Bleigewichte, Stromleitungen oder Hundeangriffe in Lebensgefahr.',
    triageQuestions: [
      {
        id: 'waterbird-hook',
        question: 'Hängt Angelschnur aus dem Schnabel, ist ein Bein/Flügel mit Schnur/Plastik umwickelt, blutet der Vogel oder liegt er abseits vom Wasser auf einer Straße?',
        yesVerdict: 'emergency',
        yesMessage:
          'Akuter Notfall! Eingeschnürte Gliedmaßen sterben ab, und verschluckte Angelhaken führen ohne tierärztliche Entfernung zum Tod. Sofort Wildtierrettung/Feuerwehr rufen!',
        noMessage:
          'Prüfe nun, ob der Vogel im Winter auf einer Eisfläche sitzt.',
      },
      {
        id: 'waterbird-ice',
        question: 'Sitzt der Schwan oder die Ente im Winter ruhig auf dem Eis und bewegt sich kaum?',
        yesVerdict: 'safe',
        yesMessage:
          'Meist KEIN Notfall! Wasservögel haben ein Wärmetausch-System in den Füßen und sitzen stundenlang reglos auf dem Eis, um Energie zu sparen. Nur ein Notfall, wenn das Gefieder wirklich im Eis eingefroren ist und das Tier verzweifelt flattert!',
        noMessage:
          'Bei einzeln umherirrenden, klagenden Entenküken ohne Mutter oder apathischen Wasservögeln bitte die örtliche Wildvogelhilfe kontaktieren.',
      },
    ],
    selfProtection: [
      'Vorsicht bei Schwänen und Gänsen: Nicht der Schnabel, sondern der kräftige Schlag mit dem Flügelbug kann beim Menschen schmerzhafte Prellungen im Gesicht verursachen!',
      'Niemals selbst aufs dünne Eis gehen – bei im Eis festgefrorenen Tieren immer die Feuerwehr (112) rufen!',
    ],
    securingSteps: [
      'Großes Handtuch, Decke oder Jacke von hinten über Rücken und beide Flügel legen, sodass die Flügel eng am Körper anliegen.',
      'Den Vogel mit beiden Armen wie ein Paket unter dem Arm (Hals zeigt nach hinten oder wird locker ohne Druck geführt – niemals die Luftröhre abdrücken!) sichern.',
      'WICHTIG BEI TAUCHERN & SCHWÄNEN: Den Boden der Transportbox dick mit einem weichen Handtuch/Decke polstern (harter Boden führt bei schweren Wasservögeln schnell zu offenen Ballengeschwüren und Brustbeinverletzungen!).',
    ],
    firstAidSteps: [
      'Bei Angelhaken / Angelschnur am Schnabel: Lose Schnur nur vorsichtig am Körper sichern (mit Kreppband am Gefieder fixieren, damit der Vogel nicht darauf tritt), aber NIEMALS daran ziehen!',
      'Wasservögel niemals in eine Badewanne mit Wasser setzen, wenn sie verletzt, erschöpft oder unterkühlt sind (Gefieder ist bei Verletzung oft nicht mehr wasserabweisend -> Ertrinkungs- & Unterkühlungsgefahr!).',
      'Ruhig, dunkel und kühl bis zimmerwarm lagern und sofort Tierrettung / Wildvogelstation kontaktieren.',
    ],
    criticalNoGos: [
      {
        title: 'NIEMALS an einer aus dem Schnabel hängenden Angelschnur ziehen!',
        reason:
          'Der Widerhaken sitzt meist bereits in der Speiseröhre oder im Drüsenmagen. Ziehen schlitzt die Speiseröhre innerlich auf!',
      },
      {
        title: 'Kein Brot füttern und kein Wasser in den Schnabel gießen!',
        reason:
          'Brot quillt im Magen auf, enthält zu viel Salz und führt bei Jungvögeln zu irreversiblen Flügelmissbildungen („Kippflügel“).',
      },
      {
        title: 'Geschwächte Wasservögel oder Küken nicht ins Wasser setzen!',
        reason:
          'Ohne intakte Bürzeldrüsen-Fettung saugt sich das Gefieder voll Wasser – die Tiere kühlen binnen Minuten aus und ertrinken.',
      },
    ],
    transportTips: [
      'Großen Umzugskarton, Hunde-Transportbox oder in eine Decke eingeschlagen (Kopf/Schnabel muss frei atmen können!) transportieren.',
    ],
    specialistType: 'Schwanenhilfe / Wildvogelhilfe / Feuerwehr (112) / Tierrettung',
  },
  {
    id: 'greifvogel',
    name: 'Greifvogel & Eule',
    subtitle: 'Mäusebussard, Turmfalke, Sperber, Waldkauz, Waldohreule',
    category: 'wildtier',
    iconName: 'Feather',
    urgencyBadge: 'Höchste Vorsicht vor den Fängen (Krallen)!',
    summary:
      'Greifvögel und Eulen verunfallen häufig an Straßen oder Glasscheiben. Bei jungen Eulen im Frühjahr gilt: Flauschige Jungvögel am Boden oder auf niedrigen Ästen klettern oft völlig gesund umher!',
    triageQuestions: [
      {
        id: 'raptor-owlet',
        question: 'Sitzt eine junge, flauschig befiederte Eule (Waldkauz / Waldohreule) aufrecht am Fuß eines Baumes oder auf einem Ast (ohne Wunden/Fliegen)?',
        yesVerdict: 'safe',
        yesMessage:
          'STOPP – Bitte NICHT mitnehmen! Junge Eulen verlassen das Nest als „Ästlinge“ lange bevor sie fliegen können. Sie klettern mit Schnabel und Krallen selbstständig wieder auf Bäume und werden nachts von den Eltern gefüttert!',
        noMessage:
          'Liegt der Greifvogel oder die Eule am Straßenrand, lässt einen Flügel hängen, blutet oder flüchtet bei Annäherung eines Menschen am Tag überhaupt nicht? Dann liegt ein Notfall vor!',
      },
    ],
    selfProtection: [
      'LEBENSWICHTIGER EIGENSCHUTZ: Die Hauptwaffe von Greifvögeln und Eulen ist NICHT der Schnabel, sondern die extrem kräftigen Fänge (Füße mit dolchartigen Krallen)!',
      'Immer dicke Leder-/Schweißerhandschuhe tragen und eine schwere Decke oder dicke Jacke über den gesamten Vogel werfen, bevor man zugreift.',
    ],
    securingSteps: [
      'Schwere Decke oder Jacke komplett über den Vogel werfen (sobald der Vogel nichts mehr sieht, stellt er die Abwehr meist sofort ein).',
      'Zuerst beide Beine (oberhalb der Fänge an den Ständern) durch die Decke hindurch fest umfassen, sodass er nicht mehr zuschlagen kann, und gleichzeitig die angelegten Flügel am Körper sichern.',
      'In einen großen, stabilen Karton (Boden mit Zeitungspapier und einem flachen, festgerollten Handtuch als Sitzstange zum Greifen) setzen und Deckel sicher verschließen.',
    ],
    firstAidSteps: [
      'Den Karton absolut dunkel und ruhig abstellen (Greifvögel sind hochgradig stressanfällig).',
      'Bei Anflugtrauma (Auto/Scheibe): Kühl lagern – niemals unter eine Wärmelampe setzen!',
      'Sofort eine spezialisierte Greifvogelstation, Falknerei-Auffangstation, NABU/LBV oder den Jagdpächter (Taggreifvögel unterliegen dem Jagdrecht!) informieren.',
    ],
    criticalNoGos: [
      {
        title: 'NIEMALS mit bloßen Händen oder dünnen Stoffhandschuhen greifen!',
        reason:
          'Ein Mäusebussard oder Habicht durchschlägt mit seinen Krallen mühelos menschliche Hände; durch den Greifreflex verkrampft sich der Fuß und lässt sich kaum noch lösen.',
      },
      {
        title: 'Niemals Wasser einflößen oder Hackfleisch/Wurst füttern!',
        reason:
          'Greifvögel decken ihren Flüssigkeitsbedarf über Beutetiere; eingeflößtes Wasser führt zum Erstickungstod, und falsches Fleisch bei unterkühlten Vögeln führt zur tödlichen Kropfverstopfung.',
      },
      {
        title: 'Niemals in einen Draht- oder Gitterkäfig sperren!',
        reason:
          'Greifvögel zerstören sich am Gitter binnen Minuten die Wachshaut am Schnabel und die überlebenswichtigen Handschwingen.',
      },
    ],
    transportTips: [
      'Großen, abgedunkelten Karton verwenden und während der Fahrt komplett geschlossen halten.',
    ],
    specialistType: 'Greifvogelstation / Wildtierhilfe / Vogelkundige Tierklinik',
  },
  {
    id: 'fuchs_marder',
    name: 'Fuchs / Marder / Dachs',
    subtitle: 'Rotfuchs, Steinmarder, Dachs, Waschbär (Raubwild)',
    category: 'wildtier',
    iconName: 'ShieldAlert',
    urgencyBadge: 'Abstand halten: Räude-, Staupe- & Bissgefahr!',
    summary:
      'Bei Füchsen, Mardern, Dachsen und Waschbären gilt höchste Vorsicht: Verletzte Tiere beißen in Panik heftig zu, und Erkrankungen wie Fuchsräude oder Staupe sind für Haustiere (und teils Menschen) ansteckend!',
    triageQuestions: [
      {
        id: 'fox-pup',
        question: 'Siehst du im Frühjahr (April–Juni) junge Füchse am Bau oder im Garten spielen, die munter und wohlgenährt wirken?',
        yesVerdict: 'safe',
        yesMessage:
          'KEIN Notfall! Junge Füchse sind neugierig und spielen auch tagsüber vor dem Bau, während die Fähe (Mutter) auf Jagd ist. Bitte Abstand halten und keinesfalls anfüttern!',
        noMessage:
          'Ist das Tier angefahren, stark abgemagert mit kahlen/krustigen Hautstellen (Räude), zittert/krampft (Staupe) oder ist es ein schreiendes, noch blindes Marderbaby am Boden?',
      },
      {
        id: 'fox-sick',
        question: 'Liegt ein verletztes Tier am Straßenrand, wirkt es völlig apathisch/orientierungslos oder hat es stark verkrustete, haarlose Stellen am Körper?',
        yesVerdict: 'emergency',
        yesMessage:
          'Notfall – aber STRIKTEN ABSTAND HALTEN! Nicht selbst anfassen! Verständige sofort die Polizei (110/133/117), die Wildtierrettung oder den zuständigen Jagdpächter.',
        noMessage:
          'Beobachte das Tier aus sicherer Entfernung und halte Hunde an der kurzen Leine.',
      },
    ],
    selfProtection: [
      'ERwachsene Füchse, Dachse und Marder NIEMALS selbst anfassen! Es besteht akute Bissgefahr sowie Infektionsgefahr (Fuchsräude durch Grabmilben, Staupe-Virus, Fuchsbandwurm).',
      'Eigene Hunde sofort anleinen und strikt vom Fundort fernhalten (Räude-Milben und Staupe übertragen sich auch indirekt!).',
    ],
    securingSteps: [
      'Bei erwachsenen Füchsen, Dachsen oder Waschbären: NICHT selbst einfangen! Unfallstelle sichern, genauen GPS-Fundort kopieren und Polizei / Tierrettung / Jagdpächter rufen.',
      'AUSNAHME VERWAISTES MARDER-BABY (kleines Jungtier, das z. B. vom Dachboden gefallen ist): Nur mit dicken Lederhandschuhen und Handtuch in einen hohen, ausbruchsicheren Karton mit handwarmer Wärmflasche setzen.',
    ],
    firstAidSteps: [
      'Ruhezone schaffen: Menschen und Hunde auf mindestens 15–20 Meter Abstand halten.',
      'Sitzt ein kranker Fuchs im eigenen Garten/Schuppen: Rückzugsort nicht versperren, Foto/Video aus sicherer Distanz (durchs Fenster) für die Wildtierhilfe/den Jäger machen, um Räude oder Staupe einzuschätzen.',
      'Füchse, Dachse, Steinmarder und Waschbären unterliegen dem Jagdrecht – immer Polizei oder offizielle Wildtierhilfe hinzuziehen!',
    ],
    criticalNoGos: [
      {
        title: 'Erwachsene Füchse oder Dachse NIEMALS selbst anfassen oder ins Auto laden!',
        reason:
          'Neben schwersten Bissverletzungen und Seuchengefahr (Staupe/Räude) verstößt die Mitnahme gegen das Jagdrecht (§ 292 StGB).',
      },
      {
        title: 'Vermeintlich „zahme“ Füchse niemals streicheln oder füttern!',
        reason:
          'Wenn ein Wildtier plötzlich jede Scheu verliert, orientierungslos wirkt oder zuckt, leidet es fast immer an einer schweren Gehirnentzündung durch Staupe oder Toxoplasmose.',
      },
    ],
    transportTips: [
      'Transport erwachsener Raubtiere ausschließlich durch ausgerüstete Tierrettung, Wildtierstation oder Jagdausübungsberechtigte!',
    ],
    specialistType: 'Polizei (110) / Wildtierrettung / Jagdpächter / Marderhilfe',
  },
];

export const DACH_EMERGENCY_HOTLINES: EmergencyHotline[] = [
  // DEUTSCHLAND (DE)
  {
    id: 'de-polizei',
    name: 'Polizei Notruf (Wildunfall & Gefahrenabwehr)',
    country: 'DE',
    regionLabel: 'Deutschlandweit',
    phone: '110',
    phoneDisplay: '110',
    category: 'police_fire',
    animalIds: ['reh_wild', 'fuchs_marder', 'hase_kaninchen', 'hund', 'katze'],
    availability: '24/7 Notruf',
    description:
      'Bei Wildunfällen (Reh, Wildschwein, Fuchs, Dachs), Tieren auf Straßen oder Hunden im heißen Auto. Verständigt den zuständigen Jagdpächter.',
  },
  {
    id: 'de-feuerwehr',
    name: 'Feuerwehr & Rettungsleitstelle',
    country: 'DE',
    regionLabel: 'Deutschlandweit / EU',
    phone: '112',
    phoneDisplay: '112',
    category: 'police_fire',
    availability: '24/7 Notruf',
    description:
      'Bei akuter technischer Tierrettung (Tier im Gully, auf dem Eis eingebrochen, in Kippfenster in unerreichbarer Höhe eingeklemmt).',
  },
  {
    id: 'de-eichhoernchen',
    name: 'Eichhörnchen-Notruf e.V. (Zentrale)',
    country: 'DE',
    regionLabel: 'Deutschlandweit (Pflegestellen-Vermittlung)',
    phone: '+4970020020012',
    phoneDisplay: '0700 200 200 12 (oder 0160 93887616)',
    category: 'wildlife',
    animalIds: ['eichhoernchen'],
    availability: 'Täglich erreichbar (Notfallvermittlung)',
    description:
      'Vermittelt bundesweit die nächstgelegene spezialisierte Eichhörnchen-Pflegestelle und berät sofort am Telefon zur Erstversorgung.',
    website: 'https://www.eichhoernchen-notruf.com',
  },
  {
    id: 'de-nabu-fledermaus',
    name: 'NABU Fledermaus-Hotline',
    country: 'DE',
    regionLabel: 'Deutschlandweit',
    phone: '+49302849845000',
    phoneDisplay: '030 284 984-5000',
    category: 'wildlife',
    animalIds: ['fledermaus'],
    availability: 'Mo–Fr & Notfall-Bandansage mit regionalen Experten',
    description:
      'Beratung bei verletzten, geschwächten oder verflogenen Fledermäusen und Vermittlung an regionale Fledermaus-Sachverständige.',
    website: 'https://www.nabu.de/tiere-und-pflanzen/saeugetiere/fledermaeuse/18829.html',
  },
  {
    id: 'de-pro-igel',
    name: 'Pro Igel e.V. – Igel-Notfallberatung',
    country: 'DE',
    regionLabel: 'Deutschland / DACH',
    phone: '+4941857074688',
    phoneDisplay: '04185 707 46 88 (Info & Pflegestellen-Suche)',
    category: 'wildlife',
    animalIds: ['igel'],
    availability: 'Infotelefon & bundesweite Stationsliste online',
    description:
      'Fachverband für Igelschutz: Sofort-Ratgeber und Verzeichnis geprüfter Igelpflegestationen nach Postleitzahl.',
    website: 'https://www.pro-igel.de',
  },
  {
    id: 'de-wildvogelhilfe',
    name: 'Wildvogelhilfe.org – Auffangstationen nach PLZ',
    country: 'DE',
    regionLabel: 'Deutschland / Österreich / Schweiz',
    phone: '+496151893097',
    phoneDisplay: 'Online-Verzeichnis & Mauerseglerklinik (06151 893097)',
    category: 'wildlife',
    animalIds: ['vogel', 'wasservogel', 'greifvogel'],
    availability: 'Saisonale Notaufnahme & Online-Stationsliste',
    description:
      'Deutsche Gesellschaft für Mauersegler e.V. (Frankfurt) sowie das umfangreichste PLZ-Verzeichnis für Wildvogel-, Greifvogel- & Wasservogel-Auffangstationen im DACH-Raum.',
    website: 'https://wp.wildvogelhilfe.org/auffangstationen/karte-der-auffangstationen/',
  },
  {
    id: 'de-tasso',
    name: 'TASSO e.V. Haustierzentralregister (24h Notruf)',
    country: 'DE',
    regionLabel: 'Deutschland / Europa',
    phone: '+496190937300',
    phoneDisplay: '+49 (0) 6190 93 73 00',
    category: 'registry',
    animalIds: ['hund', 'katze', 'hase_kaninchen'],
    availability: '24/7 rund um die Uhr',
    description:
      'Wenn du einen Hund, eine Katze oder ein Heimtier mit TASSO-Plakette oder bekannter Chip-/Tätowierungsnummer gefunden hast.',
    website: 'https://www.tasso.net',
  },

  // ÖSTERREICH (AT)
  {
    id: 'at-polizei',
    name: 'Polizei Österreich (Wildunfall & Straßensicherung)',
    country: 'AT',
    regionLabel: 'Österreichweit',
    phone: '133',
    phoneDisplay: '133 (oder Euro-Notruf 112)',
    category: 'police_fire',
    animalIds: ['reh_wild', 'fuchs_marder', 'hase_kaninchen', 'hund', 'katze'],
    availability: '24/7 Notruf',
    description:
      'Verständigt bei Wildunfällen in Österreich sofort die zuständige Jägerschaft bzw. Straßenmeisterei.',
  },
  {
    id: 'at-wildtierservice-wien',
    name: 'Wildtierservice Wien & Umgebung (MA 49)',
    country: 'AT',
    regionLabel: 'Wien & Ostösterreich',
    phone: '+431400049090',
    phoneDisplay: '+43 1 4000-49090',
    category: 'wildlife',
    animalIds: [
      'igel',
      'vogel',
      'wasservogel',
      'greifvogel',
      'hase_kaninchen',
      'fuchs_marder',
      'eichhoernchen',
      'fledermaus',
      'reh_wild',
      'amphibien',
    ],
    availability: 'Täglich 07:30–22:00 Uhr',
    description:
      'Offizielle Wildtier-Notrufnummer der Stadt Wien für verletzte, kranke oder verwaiste Wildtiere.',
    website: 'https://www.wien.gv.at/umwelt/wald/wildtierservice/',
  },
  {
    id: 'at-tierschutz-austria',
    name: 'Tierschutz Austria – Tierrettungs-Hotline',
    country: 'AT',
    regionLabel: 'Österreich (Raum Wien / NÖ & Beratung)',
    phone: '+4316992480',
    phoneDisplay: '+43 1 699 24 80',
    category: 'vet_emergency',
    availability: '24/7 Notruf',
    description:
      'Aufnahme und Erstversorgung von verletzten Fundtieren sowie Wildtieren im Tierschutzhaus Vösendorf.',
    website: 'https://www.tierschutz-austria.at',
  },
  {
    id: 'at-animaldata',
    name: 'Animaldata.com – Österreichische Haustierdatenbank',
    country: 'AT',
    regionLabel: 'Österreichweit',
    phone: '+43662873242',
    phoneDisplay: '+43 662 87 32 42',
    category: 'registry',
    animalIds: ['hund', 'katze'],
    availability: 'Online-Chipabfrage 24/7',
    description:
      'Abfrage registrierter Mikrochip-Nummern bei entlaufenen Hunden und Katzen in Österreich.',
    website: 'https://www.animaldata.com',
  },

  // SCHWEIZ (CH)
  {
    id: 'ch-polizei',
    name: 'Polizei Schweiz (Wildhut-Aufgebot / Wildunfall)',
    country: 'CH',
    regionLabel: 'Schweizweit',
    phone: '117',
    phoneDisplay: '117',
    category: 'police_fire',
    animalIds: ['reh_wild', 'fuchs_marder', 'hase_kaninchen', 'hund', 'katze'],
    availability: '24/7 Notruf',
    description:
      'In der Schweiz sind Wildunfälle zwingend meldepflichtig! Über die 117 wird sofort der kantonale Wildhüter oder Jagdaufseher aufgeboten.',
  },
  {
    id: 'ch-tierrettungsdienst',
    name: 'Stiftung TierRettungsDienst Schweiz (24h)',
    country: 'CH',
    regionLabel: 'Zürich / Ost- & Zentralschweiz',
    phone: '+41442112222',
    phoneDisplay: '+41 44 211 22 22 (oder 0800 211 222)',
    category: 'vet_emergency',
    availability: '24/7 Notruf',
    description:
      'Spezialisierte Tierambulanz für verletzte Haus- und Wildtiere rund um die Uhr.',
    website: 'https://www.tierrettungsdienst.ch',
  },
  {
    id: 'ch-vogelwarte',
    name: 'Schweizerische Vogelwarte Sempach – Notfallberatung',
    country: 'CH',
    regionLabel: 'Schweizweit',
    phone: '+41414629700',
    phoneDisplay: '+41 41 462 97 00',
    category: 'wildlife',
    animalIds: ['vogel', 'wasservogel', 'greifvogel'],
    availability: 'Pflegestellen-Verzeichnis CH & Beratung',
    description:
      'Kompetenzzentrum für verletzte Wildvögel mit kantonalem Verzeichnis aller Schweizer Vogelpflegestationen.',
    website: 'https://www.vogelwarte.ch/de/vogelwelt/ratgeber/vogel-gefunden/',
  },
  {
    id: 'ch-fledermausschutz',
    name: 'Stiftung Fledermausschutz Schweiz – Nottelefon',
    country: 'CH',
    regionLabel: 'Schweizweit',
    phone: '+41793301414',
    phoneDisplay: '+41 79 330 14 14',
    category: 'wildlife',
    animalIds: ['fledermaus'],
    availability: '24/7 Nottelefon für gefundene Fledermäuse',
    description:
      'Direkte Sofortberatung und kantonale Pflegestellenvermittlung für Fledermäuse in Not in der Schweiz.',
    website: 'https://fledermausschutz.ch/notfall',
  },
  {
    id: 'ch-stmz',
    name: 'STMZ – Schweizerische Tiermeldezentrale',
    country: 'CH',
    regionLabel: 'Schweizweit',
    phone: '+41848357358',
    phoneDisplay: '0848 357 358',
    category: 'registry',
    animalIds: ['hund', 'katze'],
    availability: '24/7 Fundtiermeldung',
    description:
      'Offizielle Meldestelle für gefundene und vermisste Heimtiere in der gesamten Schweiz.',
    website: 'https://www.stmz.ch',
  },
];

export const CAR_KIT_ITEMS: CarKitItem[] = [
  {
    id: 'kit-box',
    title: 'Stabiler Faltkarton (mit vorgestochenen Luftlöchern)',
    purpose: 'Flach im Kofferraum verstaubar; binnen 30 Sekunden einsatzbereit für Igel, Vögel, Katzen oder Eichhörnchen.',
    priority: 'essentiell',
  },
  {
    id: 'kit-gloves',
    title: 'Dicke Leder- oder Gartenarbeitshandschuhe',
    purpose: 'Unverzichtbar für den Eigenschutz bei Fledermäusen, Greifvögeln, Igeln oder verängstigten Katzen.',
    priority: 'essentiell',
  },
  {
    id: 'kit-towel',
    title: 'Großes, dunkles Handtuch & Fleecedecke',
    purpose: 'Dunkelheit beruhigt Wildtiere sofort („Schockruhe“); ideal für die Burrito-Sicherungstechnik bei Katzen und Vögeln.',
    priority: 'essentiell',
  },
  {
    id: 'kit-paper',
    title: 'Rolle unbedrucktes Küchenpapier',
    purpose: 'Rutschfeste, hygienische Unterlage im Karton (keine Fäden wie bei alten Frotteetüchern, worin Krallen hängenbleiben!).',
    priority: 'essentiell',
  },
  {
    id: 'kit-heat',
    title: '2x Knick-Taschenwärmer oder leere 0,5L PET-Flasche',
    purpose: 'In ein Tuch gewickelt als lebensrettende Sofort-Wärmequelle für unterkühlte Jungtiere oder Igel.',
    priority: 'empfohlen',
  },
  {
    id: 'kit-tape',
    title: 'Rolle Klebeband (Krepp- oder Panzertape)',
    purpose: 'Zum sicheren Verschließen des Kartondeckels (besonders wichtig bei Fledermäusen und Eichhörnchen).',
    priority: 'empfohlen',
  },
  {
    id: 'kit-leash',
    title: 'Einfache Schlupfleine / Retrieverleine + Mullbinde',
    purpose: 'Zum schnellen Sichern entlaufener Hunde an Straßen sowie als provisorische Maulschlinge bei verletzten Hunden.',
    priority: 'empfohlen',
  },
  {
    id: 'kit-light',
    title: 'Stirnlampe / Taschenlampe & Warnweste',
    purpose: 'Hände frei bei nächtlichen Wildunfällen und optimale Sichtbarkeit am Straßenrand.',
    priority: 'essentiell',
  },
];
