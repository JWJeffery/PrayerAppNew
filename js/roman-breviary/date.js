/**
 * Roman Breviary 1960/1962 -- date and temporal-calendar arithmetic.
 *
 * Faithful JavaScript port of web/cgi-bin/DivinumOfficium/Date.pm from the pinned Divinum
 * Officium commit 0ce8747d7dba3276fc05937635e02360b49a60a6 (MIT licence). Behaviour, including
 * Perl integer/modulo semantics, is kept identical so the results can be diffed against the
 * Perl engine. Works in Node (CommonJS) and in the browser (global RomanBreviary).
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});

  // Perl '%' takes the sign of the right operand; JS takes the sign of the left.
  const mod = (a, b) => ((a % b) + b) % b;
  const int = (x) => Math.trunc(x); // Perl int()
  const floor = Math.floor;

  const MONTHSUP = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  function leapyear(year) {
    if (!year) return 0;
    // Perl: !(($year % 4) or !($year % 100) and ($year % 400)); 'and' binds tighter than 'or'.
    return !(year % 4 || (!(year % 100) && year % 400)) ? 1 : 0;
  }

  function date_to_ydays(day, month, year) {
    return MONTHSUP[month - 1] + day + (month > 2 ? leapyear(year) : 0);
  }

  function ydays_to_date(days, year) {
    const months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (leapyear(year)) months[2]++;
    let month = 1;
    let day = days;
    while (day > months[month] && month < 13) {
      day -= months[month];
      month++;
    }
    return [day, month, year];
  }

  function day_of_week(day, month, year) {
    if (!(day && month && year > 0)) return undefined;
    return mod(
      year * 365 + int((year - 1) / 4) - int((year - 1) / 100) + int((year - 1) / 400) - 1 + date_to_ydays(day, month, year),
      7
    );
  }

  // Returns [day, month, year].
  function geteaster(year) {
    const G = year % 19;
    const C = int(year / 100);
    const H = mod(C - int(C / 4) - int((8 * C + 13) / 25) + 19 * G + 15, 30);
    const I = H - int(H / 28) * (1 - int(H / 28) * int(29 / (H + 1)) * int((21 - G) / 11));
    const J = mod(year + int(year / 4) + I + 2 - C + int(C / 4), 7);
    const L = I - J;
    const month = 3 + int((L + 40) / 44);
    const day = L + 28 - 31 * int(month / 4);
    return [day, month, year];
  }

  function getadvent(year) {
    const christmas = date_to_ydays(25, 12, year);
    const christmasDow = day_of_week(25, 12, year) || 7;
    return christmas - christmasDow - 21; // 1st Sunday of Advent
  }

  const pad2 = (n) => String(n).padStart(2, '0');

  // Temporal week name for a date (next day if tomorrow). 'missa' is always 0 for the Office.
  function getweek(day, month, year, tomorrow, missa) {
    let t = date_to_ydays(day, month, year);
    if (tomorrow) t++;
    let n;
    const advent1 = getadvent(year);
    const christmas = date_to_ydays(25, 12, year);
    const tDay = tomorrow ? day + 1 : day;

    if (t >= advent1) {
      if (t < christmas) {
        n = 1 + floor((t - advent1) / 7);
        if (month === 11 || day < 25) return 'Adv' + n;
      }
      return 'Nat' + tDay;
    }

    const ordtime = 6 + 7 - day_of_week(6, 1, year);
    if (month === 1 && t < ordtime) return 'Nat' + pad2(tDay);

    const easter = date_to_ydays(...geteaster(year));
    if (t < easter - 63) {
      n = floor((t - ordtime) / 7) + 1;
      return 'Epi' + n;
    }
    if (t < easter - 56) return 'Quadp1';
    if (t < easter - 49) return 'Quadp2';
    if (t < easter - 42) return 'Quadp3';
    if (t < easter) {
      n = 1 + floor((t - (easter - 42)) / 7);
      return 'Quad' + n;
    }
    if (t < easter + 56) {
      n = floor((t - easter) / 7);
      return 'Pasc' + n;
    }
    n = floor((t - (easter + 49)) / 7);
    if (n < 23) return 'Pent' + pad2(n);
    const wdist = floor((advent1 - t + 6) / 7);
    if (wdist < 2) return 'Pent24';
    if (n === 23) return 'Pent23';
    return (missa ? 'PentEpi' : 'Epi') + (8 - wdist);
  }

  // The leap day is kept on 24 Feb and numbered internally as 29 Feb; later days shift by one.
  function get_sday(month, day, year) {
    if (leapyear(year) && month === 2) {
      if (day === 24) day = 29;
      else if (day > 24) day -= 1;
    }
    return pad2(month) + '-' + pad2(day);
  }

  function nextday(month, day, year) {
    const time = date_to_ydays(day, month, year) + 1;
    if (time > 365 && (!leapyear(year) || time === 367)) return get_sday(1, 1, year + 1);
    const d = ydays_to_date(time, year);
    return get_sday(d[1], d[0], d[2]);
  }

  // '' or 'mmn-d' (e.g. '081-1' = Monday after the first Sunday of August).
  function monthday(day, month, year, modernstyle, tomorrow) {
    if (month < 7) return '';
    const isLeap = leapyear(year);
    let dayOfYear = date_to_ydays(day, month, year);
    if (tomorrow) dayOfYear++;

    let litMonth = 0;
    const firstSunday = [];
    for (let m = 8; m <= 12; m++) {
      const firstOfMonth = MONTHSUP[m - 1] + 1 + isLeap;
      const dofweek = day_of_week(1, m, year);
      let fs = firstOfMonth - dofweek;
      if (dofweek >= 4 || (dofweek && modernstyle)) fs += 7;
      firstSunday.push(fs);
      if (dayOfYear >= fs) litMonth = m;
      else break;
    }
    if (!litMonth) return '';

    let advent;
    if (litMonth > 10) {
      advent = getadvent(year);
      if (dayOfYear >= advent) return '';
    }

    let week = int((dayOfYear - firstSunday[litMonth - 8]) / 7);

    // 1960: the III. week of October vanishes when the first Sunday of October is on the 4th-7th.
    if (litMonth === 10 && modernstyle && week >= 2 && ydays_to_date(firstSunday[10 - 8], year)[0] >= 4) week++;

    // November: the II. week vanishes most years (always with the 1960 rubrics): count back from Advent.
    if (litMonth === 11 && (week > 0 || modernstyle)) {
      week = 4 - floor((advent - dayOfYear - 1) / 7);
      if (modernstyle && week === 1) week = 0;
    }

    let dow = day_of_week(day, month, year);
    if (tomorrow) dow = (dow + 1) % 7;
    return pad2(litMonth) + (week + 1) + '-' + dow;
  }

  Object.assign(RB, {
    date: { mod, int, leapyear, date_to_ydays, ydays_to_date, day_of_week, geteaster, getadvent, getweek, get_sday, nextday, monthday }
  });
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
