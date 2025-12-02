// Card data for singles

/* Cartas pokemon imagenes */
import latiasYLatios from '../assets/images/pokemonSingles/latias y latias.jpg';
import mew from '../assets/images/pokemonSingles/mew.jpg';
import pikachu from '../assets/images/pokemonSingles/Pikachu.jpg';
import shinyTyranitar from '../assets/images/pokemonSingles/shiny tyranitar.jpg';
import umbreon from '../assets/images/pokemonSingles/umbreon.jpg';

/* Cartas magic imagenes */
import blackLotus from '../assets/images/magicSingles/black-lotus.webp';
import timeWalk from '../assets/images/magicSingles/time-walk.webp';
import gaeaCradle from '../assets/images/magicSingles/gaea.jpg';
import moxSaphire from '../assets/images/magicSingles/mox-saphire.avif';
import volcanicIsland from '../assets/images/magicSingles/volcanic-Island.avif';
import blackChocobo from '../assets/images/magicSingles/black-chocobo.avif';
import chainsOfMephistopheles from '../assets/images/magicSingles/chains-of-mephistopheles.jpg';
import ugin from '../assets/images/magicSingles/ugin.avif';
// Nuevas (asegúrate de tener estos archivos en assets)
import theOneRing from '../assets/images/magicSingles/the-one-ring-scroll.jpg';
import counterspellImg from '../assets/images/magicSingles/counterspell.avif';
import pactOfNegation from '../assets/images/magicSingles/pact-of-negation.jpg';
import rhysticStudy from '../assets/images/magicSingles/rhystic-study.avif';

/* Cartas yugioh imagenes (agrega estos archivos en assets) */
import drollAndLockBird from '../assets/images/yugiohSingles/droll-and-lock-bird.jpg';
import darkMagicianOfChaos from '../assets/images/yugiohSingles/Dark-Magician-Of-Chaos.jpg';
import darkMagician from '../assets/images/yugiohSingles/Dark-Magician.webp';
import fiendsmithEngraver from '../assets/images/yugiohSingles/Fiendsmith-Engraver.jpg';

// Magic Singles
export const magicCards = [
  {
    id: "black-lotus",
    nombre: "Black Lotus",
    imagen: blackLotus,
    edicion: "Alpha",
    rareza: "Mitica",
    precio: 120000000,
    descripcion: "La carta mas iconica y valiosa de MTG"
  },
  {
    id: "time-walk",
    nombre: "Time Walk",
    imagen: timeWalk,
    edicion: "Alpha",
    rareza: "Mitica",
    precio: 17000000,
    descripcion: "Permite tomar un turno extra"
  },
  {
    id: "gaea-cradle",
    nombre: "Gaea Cradle",
    imagen: gaeaCradle,
    edicion: "Urza's Saga",
    rareza: "Mitica",
    precio: 6500000,
    descripcion: "Permite generar mana verde por cada criatura que controles"
  },
  {
    id: "mox-saphire",
    nombre: "Mox Sapphire",
    imagen: moxSaphire,
    edicion: "Alpha",
    rareza: "Mitica",
    precio: 9000000,
    descripcion: "Genera mana azul"
  },
  {
    id: "volcanic-island",
    nombre: "Volcanic Island",
    imagen: volcanicIsland,
    edicion: "3era Edicion",
    rareza: "Rara",
    precio: 764000,
    descripcion: "Tierras duales que generan mana azul y rojo"
  },
  {
    id: "Black-Chocobo",
    nombre: "Chocobo Negro",
    imagen: blackChocobo,
    edicion: "Final Fantasy",
    rareza: "Mitica",
    precio: 6500000,
    descripcion: "Carta promocional de colaboracion con final fantasy, este choco es extremadamente raro de conseguir y este color es único debido a que solo está disponible en su versión japonesa"
  },
  {
    id: "chains-of-mephistopheles",
    nombre: "Chains of Mephistopheles",
    imagen: chainsOfMephistopheles,
    edicion: "Legends",
    rareza: "Mitica",
    precio: 10500000,
    descripcion: "Permite manipular las cartas que robas y forzar a tus oponentes a descartar cartas"
  },
  {
    id: "ugin",
    nombre: "Ugin, The Spirit Dragon",
    imagen: ugin,
    edicion: "Fate Reforged",
    rareza: "Mitica",
    precio: 915000,
    descripcion: "Un poderoso planeswalker que puede controlar dragones y manipular el colorless mana"
  },
  {
    id: "one-ring",
    nombre: "The One Ring",
    imagen: theOneRing,
    edicion: "The lord of the Rings",
    rareza: "Mitica",
    precio: 415000,
    descripcion: "Carta de colaboracion con el señor de los anillos, otorga proteccion y sigilo a su portador"
  },
  {
    id: "counterspell",
    nombre: "Counterspell",
    imagen: counterspellImg,
    edicion: "Secret Lair",
    rareza: "Rara",
    precio: 55000,
    descripcion: "Contrarresta un hechizo objetivo"
  },
  {
    id: "pon",
    nombre: "Pact Of Negation",
    imagen: pactOfNegation,
    edicion: "Masterpiece Series: Invocations",
    rareza: "Mitica",
    precio: 139000,
    descripcion: "Contrarresta un hechizo sin pagar su coste de mana, pero en tu siguiente turno debes pagar 3 manas incoloros o perderas el juego"
  },
  {
    id: "rhystic-study",
    nombre: "Rhystic Study",
    imagen: rhysticStudy,
    edicion: "Wilds of Eldraine",
    rareza: "Mitica",
    precio: 129000,
    descripcion: "Cada vez que un oponente lanza un hechizo, puedes robar una carta a menos que pague 1 mana incoloro"
  }
];

export const pokemonCards = [
  {
    id: 'pokemon-latias-y-latios',
    nombre: 'Latias y Latios',
    imagen: latiasYLatios,
    edicion: 'Promo',
    rareza: 'Rara',
    precio: 12,
    descripcion: 'Carta especial de Latias y Latios.'
  },
  {
    id: 'pokemon-mew',
    nombre: 'Mew',
    imagen: mew,
    edicion: 'Promo',
    rareza: 'Rara',
    precio: 50,
    descripcion: 'El Pokémon legendario Mew.'
  },
  {
    id: 'pokemon-pikachu',
    nombre: 'Pikachu',
    imagen: pikachu,
    edicion: 'Promo',
    rareza: 'Común',
    precio: 8,
    descripcion: 'El Pokémon más famoso y querido.'
  },
  {
    id: 'pokemon-shiny-tyranitar',
    nombre: 'Shiny Tyranitar',
    imagen: shinyTyranitar,
    edicion: 'Promo',
    rareza: 'Rara',
    precio: 30,
    descripcion: 'Tyranitar en su versión shiny.'
  },
  {
    id: 'pokemon-umbreon',
    nombre: 'Umbreon',
    imagen: umbreon,
    edicion: 'Promo',
    rareza: 'Rara',
    precio: 15,
    descripcion: 'Umbreon, evolución de Eevee tipo oscuro.'
  }
];

export const yugiohCards = [
  {
    id: "droll-and-lock-bird",
    nombre: "Droll & Lock Bird",
    imagen: drollAndLockBird,
    edicion: "1a edicion",
    rareza: "Rara",
    precio: 2000,
    descripcion: "Si una o más cartas en el Deck Principal son añadidas a la mano de tu adversario, excepto durante la Draw Phase (Efecto Rápido): puedes mandar al Cementerio esta carta en tu mano; por el resto de este turno, no se pueden añadir a la mano cartas en el Deck Principal de ningún jugador."
  },
  {
    id: "dark-magician-of-chaos",
    nombre: "Dark Magician Of Chaos",
    imagen: darkMagicianOfChaos,
    edicion: "1a edicion",
    rareza: "Rara",
    precio: 150000,
    descripcion: "Durante la End Phase, si esta carta fue Invocada de Modo Normal o Especial en este turno: puedes seleccionar 1 Carta Mágica en tu Cementerio; añádela a tu mano. Sólo puedes usar este efecto de Mago Oscuro del Caos una vez por turno. Si esta carta destruye un monstruo de tu adversario en batalla, después del cálculo de daño: destierra a ese monstruo de tu adversario. Si esta carta boca arriba fuera a dejar el Campo, en su lugar destiérrala."
  },
  {
    id: "dark-magician",
    nombre: "Dark Magician",
    imagen: darkMagician,
    edicion: "1a edicion",
    rareza: "Rara",
    precio: 150000,
    descripcion: "El más grande de los magos en cuanto al ataque y la defensa."
  },
  {
    id: "fiendsmith-engraver",
    nombre: "Fiendsmith Engraver",
    imagen: fiendsmithEngraver,
    edicion: "1a edicion",
    rareza: "Secreta",
    precio: 75000,
    descripcion: "Puedes descartar esta carta; añade a tu mano 1 Mágica/Trampa Demoniherrero/a en tu Deck. Puedes seleccionar 1 Carta de Equipo Demoniherrero/a que controles y 1 monstruo en el Campo; mándalos al Cementerio. Si esta carta está en tu Cementerio: puedes barajar al Deck/Deck Extra otro monstruo Demonio de LUZ en tu Cementerio; Invoca esta carta de Modo Especial. Sólo puedes usar cada efecto de Demoniherrero Grabador una vez por turno."
  }
];

export const allCards = [...magicCards, ...pokemonCards, ...yugiohCards];
