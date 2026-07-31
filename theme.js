/* ===========================================================================
   theme.js — shared theme vocabulary for Optima teacher home pages.

   Loaded by BOTH index.html (the builder) and home.html (the hosted page),
   so the two can never drift apart. Plain ES5-ish, no modules, no build step.

   THE GOVERNING RULE
   ------------------
   Subject matter outranks personal taste. A subject family fixes the
   structural vocabulary of a page — what one unit is called, what the module
   trail is called, which motifs appear, and the default accent. A teacher's
   personal style only changes *voice and ornament* on top of that. The brand
   (navy chrome, the owl, Segoe UI, the accent set) is fixed for everyone and
   is not negotiable by either layer.
   =========================================================================== */

var OAO = (function () {
  'use strict';

  /* -------------------------------------------------------------- accents
     Every accent carries two pre-computed variants. `onDark` clears WCAG AA
     (4.5:1) against the navy chrome #0E1C42; `onLight` clears AA against both
     #FFFFFF and the #F4F6FB page wash. Use the right one for the surface —
     do not use `base` for text. Verified numerically, not by eye.          */
  var ACCENTS = {
    cyan:     { name: 'Bitstream Blue', base: '#55C8E8', onDark: '#55C8E8', onLight: '#33788B' },
    gold:     { name: 'Gateway Gold',   base: '#C7922C', onDark: '#C7922C', onLight: '#8B661E' },
    purple:   { name: 'Portal Purple',  base: '#67308F', onDark: '#9C78B6', onLight: '#67308F' },
    pink:     { name: 'Pixel Pink',     base: '#A53E97', onDark: '#BB6EB1', onLight: '#A53E97' },
    green:    { name: 'Gamer Green',    base: '#76C043', onDark: '#76C043', onLight: '#4C7C2B' },
    orange:   { name: 'Odyssey Orange', base: '#F78F1E', onDark: '#F78F1E', onLight: '#A05C13' },
    darkcyan: { name: 'Deep Bitstream', base: '#0E5568', onDark: '#62909C', onLight: '#0E5568' }
  };

  /* ------------------------------------------------------------- subjects
     The higher rule. `unit` is what one module is called, `trail` names the
     module sequence, `stat` labels the module count, `motifs` is the icon
     vocabulary a teacher's style may arrange but not replace.              */
  var SUBJECTS = {
    ela:       { label: 'English & Literature',      accent: 'gold',     unit: 'Book',          trail: 'The Reading Path',      stat: 'Books',          motifs: ['📖', '✍️', '🕯️', '📜'] },
    history:   { label: 'History & Civics',          accent: 'orange',   unit: 'Era',           trail: 'The Chronicle',         stat: 'Eras',           motifs: ['🏛️', '📜', '⚖️', '🗺️'] },
    math:      { label: 'Mathematics',               accent: 'cyan',     unit: 'Unit',          trail: 'The Proof Path',        stat: 'Units',          motifs: ['📐', '🔢', '➗', '📊'] },
    science:   { label: 'Science',                   accent: 'green',    unit: 'Investigation', trail: 'The Field Log',         stat: 'Investigations', motifs: ['🔬', '🧪', '🌡️', '🪐'] },
    cs:        { label: 'Computer Science & Digital', accent: 'purple',  unit: 'Module',        trail: 'The Build Path',        stat: 'Modules',        motifs: ['⌨️', '🖥️', '⚙️', '🔌'] },
    world:     { label: 'World Languages',           accent: 'pink',     unit: 'Etapa',         trail: 'The Route',             stat: 'Etapas',         motifs: ['🗣️', '🌍', '✈️', '🧳'] },
    classical: { label: 'Latin & Greek',             accent: 'gold',     unit: 'Liber',         trail: 'The Cursus',            stat: 'Libri',          motifs: ['🏛️', '🦉', '⚔️', '🏺'] },
    art:       { label: 'Visual Art',               accent: 'pink',     unit: 'Studio',        trail: 'The Studio Sequence',   stat: 'Studios',        motifs: ['🎨', '🖌️', '✏️', '🖼️'] },
    music:     { label: 'Music',                    accent: 'purple',   unit: 'Movement',      trail: 'The Score',             stat: 'Movements',      motifs: ['🎼', '🎻', '🎹', '🥁'] },
    pe:        { label: 'PE & Health',              accent: 'orange',   unit: 'Block',         trail: 'The Training Plan',     stat: 'Blocks',         motifs: ['🏃', '💪', '🫀', '🥗'] },
    elective:  { label: 'Electives & Career',       accent: 'darkcyan', unit: 'Phase',         trail: 'The Pathway',           stat: 'Phases',         motifs: ['🧭', '💼', '🎯', '🗂️'] }
  };

  /* --------------------------------------------------------------- styles
     Voice and ornament only. Deliberately no childish register: the warmest
     option here is "Homey", which is warm rather than cutesy.              */
  var STYLES = {
    practical: {
      label: 'Practical', blurb: 'Direct and uncluttered. Says what to do and stops.',
      radius: 8, ornament: 'none', mono: false,
      voice: {
        tagline: 'Everything you need for this course, in one place.',
        trailNote: 'Work through these in order.',
        cpHeading: 'Worth Keeping',
        heroLede: 'Start here each week. Your current unit, your announcements, and every link you need are on this page.'
      }
    },
    scholarly: {
      label: 'Scholarly', blurb: 'Formal and ruled. Reads like a well-set syllabus.',
      radius: 4, ornament: 'rule', mono: false,
      voice: {
        tagline: "The year's work, set out in order.",
        trailNote: 'Each unit builds on the one before it.',
        cpHeading: 'Commonplace',
        heroLede: 'This page holds the full arc of the course: the sequence of units, the current week’s notices, and the standing resources you will return to.'
      }
    },
    philosophical: {
      label: 'Philosophical', blurb: 'Question-forward. Leads with what is at stake.',
      radius: 6, ornament: 'quote', mono: false,
      voice: {
        tagline: 'A year of questions worth sitting with.',
        trailNote: 'Each unit opens with a question. Start there.',
        cpHeading: 'An Idea Worth Keeping',
        heroLede: 'Every unit below begins with a question that has no quick answer. The reading, the practice, and the writing are how we earn one.'
      }
    },
    whimsical: {
      label: 'Whimsical', blurb: 'Light and curious, without going cute.',
      radius: 16, ornament: 'sparkle', mono: false,
      voice: {
        tagline: "Welcome in — there's a great deal worth noticing this year.",
        trailNote: 'Pick up wherever you left off.',
        cpHeading: 'Something Worth Keeping',
        heroLede: 'There is more hiding in this subject than anyone lets on. Each unit below is one more place to go looking.'
      }
    },
    fantastical: {
      label: 'Fantastical', blurb: 'Quest framing and crest-forward heraldry.',
      radius: 10, ornament: 'crest', mono: false,
      voice: {
        tagline: 'The road ahead, one stage at a time.',
        trailNote: 'Each stage opens the next.',
        cpHeading: 'From the Chronicle',
        heroLede: 'The way through is marked below. Each stage asks something different of you, and none of them can be skipped.'
      }
    },
    techy: {
      label: 'Techy', blurb: 'Terse and systemic. Monospaced labels, tight grid.',
      radius: 3, ornament: 'grid', mono: true,
      voice: {
        tagline: 'Course systems, status, and entry points.',
        trailNote: 'Sequential. Complete in order.',
        cpHeading: 'Logged',
        heroLede: 'Current unit, open notices, and every entry point for this course. Everything routes from here.'
      }
    },
    homey: {
      label: 'Homey', blurb: 'Warm and unhurried. Softer surfaces, more air.',
      radius: 14, ornament: 'soft', mono: false,
      voice: {
        tagline: "Glad you're here. Start wherever you need to.",
        trailNote: 'Take these one at a time.',
        cpHeading: 'On the Wall',
        heroLede: 'No rush and no guesswork. What you need this week is right here, and the rest of the year is laid out below whenever you want to look ahead.'
      }
    },
    natural: {
      label: 'Natural', blurb: 'Rooted and seasonal. Botanical motifs, patient pace.',
      radius: 12, ornament: 'botanical', mono: false,
      voice: {
        tagline: 'The year, season by season.',
        trailNote: 'Each unit grows out of the one before it.',
        cpHeading: 'From the Field Notebook',
        heroLede: 'This subject rewards patient attention. Each unit below asks you to look at something longer than is comfortable, and to write down what you actually notice.'
      }
    }
  };

  /* --------------------------------------------------------------- houses
     Four houses, each with the virtue from its crest ribbon. `color` is
     sampled from the crest artwork; white text clears AA on all four.      */
  var HOUSES = {
    galahad:     { label: 'Galahad',     virtue: 'Perseverance',    color: '#1E4620', img: 'houses/galahad.png' },
    cincinnatus: { label: 'Cincinnatus', virtue: 'Courage',         color: '#8C1A0E', img: 'houses/cincinnatus.png' },
    nightingale: { label: 'Nightingale', virtue: 'Service',         color: '#10467F', img: 'houses/nightingale.png' },
    odysseus:    { label: 'Odysseus',    virtue: 'Self-Governance', color: '#4A2472', img: 'houses/odysseus.png' }
  };

  /* ------------------------------------------------------ config encoding
     A personalized page carries its whole configuration in the URL fragment.
     The fragment is never sent to the server, so a single static file on
     GitHub Pages can render unlimited distinct teacher pages with no
     per-teacher file, no database, and no write access from the browser. */
  function b64uEncode(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64uDecode(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function encodeCfg(cfg) { return b64uEncode(JSON.stringify(cfg)); }
  function decodeCfg(s) {
    try { return JSON.parse(b64uDecode(s)); } catch (e) { return null; }
  }

  /* ------------------------------------------------------------- resolve
     Collapse a raw config into the concrete values a renderer needs, with
     subject outranking style and both outranked by the brand.             */
  function resolve(cfg) {
    cfg = cfg || {};
    var subject = SUBJECTS[cfg.subject] || SUBJECTS.elective;
    var style = STYLES[cfg.style] || STYLES.practical;
    var accent = ACCENTS[cfg.accent] || ACCENTS[subject.accent];
    var house = cfg.house ? (HOUSES[cfg.house] || null) : null;
    return {
      subject: subject,
      style: style,
      accent: accent,
      house: house,
      // subject wins on structural nouns; a teacher may override the visible
      // label but not the vocabulary the page is built from
      unit: cfg.unitNoun || subject.unit,
      trail: cfg.trailName || subject.trail,
      motifs: subject.motifs,
      radius: style.radius,
      // gold is reserved for announcements; if the accent IS gold, the
      // announcement rail steps aside to cyan so only two accents ever show
      notice: (cfg.accent === 'gold' || (!cfg.accent && subject.accent === 'gold'))
        ? ACCENTS.cyan : ACCENTS.gold
    };
  }

  return {
    ACCENTS: ACCENTS, SUBJECTS: SUBJECTS, STYLES: STYLES, HOUSES: HOUSES,
    encodeCfg: encodeCfg, decodeCfg: decodeCfg, resolve: resolve
  };
})();
