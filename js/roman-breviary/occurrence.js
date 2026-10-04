/**
 * Roman Breviary 1960/1962 -- which office is said today (occurrence).
 *
 * Port of occurrence(), precedence(), climit1960(), extract_common(), emberday() and helpers from
 * web/cgi-bin/horas/horascommon.pl of the pinned Divinum Officium commit
 * 0ce8747d7dba3276fc05937635e02360b49a60a6 (MIT). The structure follows the Perl line for line so
 * the two can be diffed; branches that cannot be reached for the Rubrics 1960 versions are kept
 * (they test the version string) and cost nothing.
 *
 * Scope of this file (engine rebuild phase 2): occurrence for the Lauds/Matins/minor-hours view
 * (hora is not Vespera/Completorium). Concurrence (Vespers) is phase 4 and throws if requested.
 * Latin data only; general calendar only.
 */
(function (root) {
  'use strict';
  const RB = (root.RomanBreviary = root.RomanBreviary || {});
  const D = RB.date;
  const { perlSplit, perlTrue: T } = RB;

  const S = (x) => (x === undefined || x === null ? '' : String(x));
  const N = (x) => {
    // Perl numification: leading numeric prefix, else 0
    const m = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(S(x));
    return m ? parseFloat(m[0]) : 0;
  };

  const EMPTY = {
    has: () => false,
    get: () => undefined,
    keys: () => [],
    set: () => {},
    isEmpty: true
  };

  function createCalendar(store) {
    const ctx = {
      version: 'Rubrics 1960 - 1960',
      dioecesis: 'Generale',
      hora: 'Laudes',
      missa: 0,
      missanumber: undefined,
      votive: 'Hodie',
      caller: '',
      testmode: undefined,
      lang1: 'Latin',
      lang2: 'Latin'
    };
    const directorium = RB.createDirectorium(store);
    const ss = RB.createSetupString(store, ctx, directorium);
    const { get_from_directorium, transfered } = directorium;
    const off = (x) => x || EMPTY;

    const subdirname = (subdir, version) => {
      if (/Cisterciensis/.test(version)) return subdir + 'Cist/';
      if (/^Monastic/.test(version)) return subdir + 'M/';
      if (/^Ordo Praedicatorum/.test(version)) return subdir + 'OP/';
      return subdir + '/';
    };

    function checkfile(name) {
      const r = ss.checklatinfile(name);
      return r;
    }

    function resetState() {
      Object.assign(ctx, {
        winner: '', commemoratio: '', commemoratio1: '', commune: '', scriptura: '',
        communetype: undefined, rank: undefined, comrank: 0, laudes: '', vespera: undefined, cvespera: undefined,
        tvesp: undefined, svesp: undefined, tname: '', sname: '', sanctoraloffice: undefined,
        trank: [], srank: [], commemoentries: [], ccommemoentries: [],
        tempora: EMPTY, saint: EMPTY, winnerHash: EMPTY, commemoratioHash: EMPTY, communeHash: EMPTY, scripturaHash: EMPTY,
        rule: '', communerule: '', transfervigil: '', initia: undefined, laudesonly: undefined, commemorated: undefined,
        octavam: '', litaniaflag: 0, duplex: '', C10: '', dayname: ['', '', ''], tomorrowname: ['', '', ''],
        monthday: undefined, error: ''
      });
    }

    // ------------------------------------------------------------------ small helpers
    function nooctnat() {
      return /19(?:55|6)/.test(ctx.version) && (ctx.month < 12 || ctx.day < 25);
    }

    function emberday() {
      const dow = D.day_of_week(ctx.day, ctx.month, ctx.year);
      if (dow < 3 || dow === 4) return 0;
      if (/Adv3|Quad1|Pasc7/i.test(S(ctx.dayname[0]))) return 1;
      if (ctx.month !== 9) return 0;
      if (/Quat[t]*uor/i.test(S(ctx.winnerHash.get('Rank'))) || /Quat[t]*uor/i.test(S(ctx.commemoratioHash.get('Rank'))) || /Quat[t]*uor/i.test(S(ctx.scripturaHash.get('Rank')))) return 1;
      return 0;
    }

    // Returns [communetype, commune] (always a pair, possibly undefined members) like the Perl list.
    function extract_common(commonField, officeRank, version, paschalTide) {
      let communetype, commune;
      commonField = S(commonField);
      let m;
      if ((m = /^(ex|vide)\s*(?!Sancti)((?:[a-z\s]*\/)?C[0-9]+[a-z]*\-*[123]*)/i.exec(commonField))) {
        communetype = m[1];
        commune = m[2];
        if (/Trident/.test(version) && N(officeRank) >= 2) communetype = 'ex';
        if (paschalTide) {
          const p = subdirname('Commune', version) + commune + 'p.txt';
          const p2 = p.replace('Cist', 'M');
          if (store.exists('Latin', p) || store.exists('Latin', p2)) commune += 'p';
        }
        if (T(commune)) commune = subdirname('Commune', version) + commune + '.txt';
      } else if ((m = /(ex|vide)\s*Sancti(?:M|OP|Cist)?\/(.*)\s*$/i.exec(commonField))) {
        communetype = m[1];
        commune = subdirname('Sancti', version) + m[2] + '.txt';
        if (/Trident/.test(version)) communetype = 'ex';
      } else if ((m = /(ex|vide)\s*(.*)\s*$/i.exec(commonField))) {
        communetype = m[1];
        let name = m[2].replace(/Tempora(?:M|OP|Cist)?\//i, '');
        if (!/Sancti|Commune/i.test(name)) commune = subdirname('Tempora', version) + name + '.txt';
        else commune = name + '.txt';
        if (/Trident/.test(version)) communetype = 'ex';
      }
      return [communetype, commune];
    }

    // returns 0/1/2: 1 = commemoration allowed, 2 = allowed ad Laudes only
    function climit1960(c) {
      if (!T(c)) return 0;
      const { version, winner, hora, rank } = ctx;
      if (!/196/.test(version) || !/sancti/i.test(c)) return 1;
      if (/7-16/.test(c) && /C10/.test(winner)) return 0;
      const w = off(ss.setupstring('Latin', winner));
      if (!/tempora|C10/i.test(winner)) return 1;
      const cc = off(ss.setupstring('Latin', c));
      const r = perlSplit(S(cc.get('Rank')), ';;');
      if (/Dominica/i.test(S(w.get('Rank')))) {
        if ((!/(Vespera|Completorium)/i.test(hora) && N(r[2]) >= 5) || N(r[2]) >= 6) return 1;
        if (/Laudes/i.test(hora) && N(r[2]) >= 5 && N(rank) < 6) return 1;
      } else if (N(r[2]) >= 6) return 1;
      else if (N(r[2]) > 1) return 2;
      return 0;
    }

    function initiarule(month, day, year) {
      const key = D_pad(month) + '-' + D_pad(day);
      let f = get_from_directorium('stransfer', ctx.version, key, year);
      return S(f).replace(/(XX-XX)?;;.*$/, '');
    }
    const D_pad = (n) => String(n).padStart(2, '0');

    // ------------------------------------------------------------------ occurrence
    function occurrence(day, month, year, version, dioecesis, tomorrow) {
      const hora = ctx.hora;
      const missa = ctx.missa;
      const caller = ctx.caller;
      ctx.transfervigil = '';
      let trank = '';
      let srank = '';
      let transfer, permTransfer, tempTransfer, transferedName;
      let sday = '', tday = '', sfile = '', tfile = '', weekname = '';
      let strank;

      if (tomorrow) {
        sday = D.nextday(month, day, year);
        ctx.tomorrowname[0] = weekname = D.getweek(day, month, year, 1);
        ctx.dayofweek = (D.day_of_week(day, month, year) + 1) % 7;
      } else {
        sday = D.get_sday(month, day, year);
        weekname = ctx.dayname[0];
        ctx.dayofweek = D.day_of_week(day, month, year);
      }
      const dayofweek = ctx.dayofweek;
      const officename = [weekname, '', ''];

      // permanent transfers assigned to the day of the year
      permTransfer = S(get_from_directorium('tempora', version, sday, 0)).replace(/;;.*/, '');
      let pm;
      if ((pm = /::([a-g])/.exec(permTransfer))) {
        permTransfer = permTransfer.replace(/::([a-g])/, '');
        const litdom = pm[1];
        const easter = D.geteaster(year);
        const easterN = easter[1] * 100 + easter[0];
        const letter = D.mod(easterN - 319 + (easter[1] === 4 ? 1 : 0), 7);
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        if (D.leapyear(year) && /^(?:01|02-[01]|02-2[01239])/.test(sday)) {
          if (!new RegExp(litdom).test(letters[D.mod(letter - 6, 7)])) permTransfer = '';
        } else if (!new RegExp(litdom).test(letters[letter])) permTransfer = '';
      }
      let permArr = perlSplit(permTransfer, '~').map((p) => {
        if (T(p)) {
          if (!/tempora/i.test(p)) return subdirname('Sancti', version) + p;
          if (/monastic/i.test(version)) return subdirname('Tempora', version) + p.replace(/Tempora[^/]\//, '');
        }
        return p;
      });
      permTransfer = permArr.shift();
      if (permTransfer === undefined) permTransfer = '';

      // annual transfers (by the day of Easter)
      let transfers = S(get_from_directorium('transfer', version, sday, year));
      const tsm = /;;(.*)/.exec(transfers);
      transfers = transfers.replace(/;;(.*)/, '');
      const transferSource = tsm ? tsm[1] : undefined;
      let transfersArr = perlSplit(transfers, '~');
      if (T(transfers)) {
        transfersArr = transfersArr.map((tr) => {
          if (T(tr)) {
            if (!/tempora/i.test(tr)) return subdirname('Sancti', version) + tr;
            return subdirname('Tempora', version) + tr.replace(/Tempora\//, '');
          }
          return tr;
        });
        if (T(transferSource)) {
          permTransfer = '';
          permArr = [];
        }
        // a transferred vigil without its own file
        if (/v$/.test(S(transfersArr[0])) && !store.exists('Latin', transfersArr[0] + '.txt')) {
          if (!(D.leapyear(year) && /02-23v/.test(transfersArr[0]))) {
            ctx.transfervigil = transfersArr.shift().replace(/v$/, '.txt');
          }
          transfer = '';
        } else {
          transfer = transfersArr.shift();
        }
      }

      let tempora = EMPTY;
      let saint = EMPTY;
      let transfervigil = ctx.transfervigil;
      let trankA = [];
      let srankA = [];
      let tname = '';
      let sname = '';

      if (ctx.testmode === 'Sanctoral') {
        tfile = 'none';
      } else {
        // Temporal
        tday = subdirname('Tempora', version) + weekname + (!/Nat/i.test(weekname) ? '-' + dayofweek : '');
        tempTransfer = S(get_from_directorium('transfer', version, tday, year)) || S(get_from_directorium('tempora', version, tday, 0));
        tempTransfer = tempTransfer.replace(/;;.*/, '');
        if (/\~/.test(tempTransfer)) {
          const tr = tempTransfer.split('~');
          tempTransfer = tr.shift();
          if (/Tempora/i.test(S(tr[0]))) tday = tr.shift();
          transfersArr = transfersArr.length ? transfersArr : tr;
        }
        tfile = /Tempora/i.test(tempTransfer) ? tempTransfer : tday;

        if (T(permTransfer) && /tempora/i.test(permTransfer) && !transfered(permTransfer, year, version)) {
          tfile = permTransfer;
        } else if (/tempora/i.test(S(transfer))) {
          tfile = transfer;
          transfer = transfersArr.shift();
        } else if (T(transfered(tfile, year, version))) {
          transferedName = tfile;
          tfile = '';
        }

        let tcheck = false;
        if (T(tfile)) {
          const r = checkfile(tfile);
          if (r.ok) tfile = r.file;
          tcheck = r.ok;
        }
        if (T(tfile) && (tcheck || /Epi0/i.test(weekname))) {
          tname = tfile + '.txt';
          if (tomorrow) {
            ctx.tvesp = 1;
            tempora = off(ss.officestring('Latin', tname, 1));
            trank = S(tempora.get('Rank'));
          } else {
            ctx.tvesp = /(Vespera|Completorium)/i.test(hora) ? 3 : 2;
            tempora = off(ss.officestring('Latin', tname));
            trank = S(tempora.get('Rank'));
            ctx.initia = /!.*? 1\:1\-/.test(S(tempora.get('Lectio1'))) ? 1 : 0;
          }
          trankA = perlSplit(trank, ';;');
        } else {
          trank = '';
          tempora = EMPTY;
          tname = '';
          trankA = [];
        }
      }

      if (ctx.testmode === 'Temporal') {
        sfile = 'none';
      } else {
        // Sanctoral
        const kalentries = S(get_from_directorium('kalendar', version, sday));
        let commemoentries = perlSplit(kalentries, '~').map((k) => {
          if (T(k)) {
            if (!/tempora/i.test(k)) return subdirname('Sancti', version) + k;
            return subdirname('Tempora', version) + k.replace(/Tempora\//, '');
          }
          return k;
        });
        sfile = commemoentries.shift();
        if (sfile === undefined) sfile = '';

        if (T(permTransfer) && /Sancti/.test(permTransfer) && !transfered(permTransfer, year, version)) {
          sfile = permTransfer;
          commemoentries = [permTransfer].concat(permArr);
          // Perl: @commemoentries = @permTransfer (the remaining elements after the shift)
          commemoentries = permArr.slice();
        } else if (/Sancti/.test(S(transfer))) {
          sfile = transfer;
          commemoentries = transfersArr.slice();
        } else if (T(sfile) && T(transfered(sfile, year, version))) {
          transferedName = sfile;
          sfile = '';
        }

        // prevent duplicate vigil of St. Matthias in leap years
        if ((day === 23 || day === 22) && month === 2 && D.leapyear(year)) {
          sfile = /02-23o/.test(sfile) ? '' : /02-23/.test(sfile) ? subdirname('Sancti', version) + '02-23r' : sfile;
          commemoentries = commemoentries.filter((c) => !/02-23o/.test(c));
        }

        let scheck = false;
        if (T(sfile)) {
          const r = checkfile(sfile);
          if (r.ok) sfile = r.file;
          scheck = r.ok;
        }
        if ((T(sfile) && scheck) || !/Tempora/.test(tempTransfer === undefined ? '' : tempTransfer)) {
          if (T(sfile)) {
            sname = sfile + '.txt';
            if (T(caller) && /(Matutinum|Laudes)/i.test(hora)) sname = sname.replace(/11-02t/, '11-02');
            saint = off(ss.setupstring('Latin', sname));
            srank = S(saint.get('Rank'));
            srankA = perlSplit(srank, ';;');
          } else {
            saint = EMPTY;
            srank = '';
            srankA = [];
          }

          // Remove octaves during Quadragesima
          if (/in.*octava/i.test(S(srankA[0])) && /Quad\d|Quadp3\-[3-6]/.test(tname)) {
            sfile = commemoentries.shift();
            const r = T(sfile) ? checkfile(sfile) : { ok: false, file: sfile };
            if (r.ok) {
              sfile = r.file;
              sname = sfile + '.txt';
              saint = off(ss.setupstring('Latin', sname));
              srank = S(saint.get('Rank'));
              srankA = perlSplit(srank, ';;');
            } else {
              srank = '';
              saint = EMPTY;
              srankA = [];
            }
          }

          // A sanctoral feast moved by the temporal cycle (e.g. Spinea Corona)
          if (T(tempTransfer) && !/Tempora/.test(tempTransfer)) {
            tempTransfer = subdirname('Sancti', version) + tempTransfer;
            const r = checkfile(tempTransfer);
            if (r.ok) {
              tempTransfer = r.file;
              const tt = off(ss.setupstring('Latin', tempTransfer + '.txt'));
              const tTrank = S(tt.get('Rank'));
              const tTrankA = perlSplit(tTrank, ';;');
              if (N(tTrankA[2]) >= N(srankA[2])) {
                commemoentries.unshift(sfile);
                sname = tempTransfer + '.txt';
                saint = tt;
                srank = tTrank;
                srankA = tTrankA;
              } else {
                commemoentries.unshift(tempTransfer);
              }
            }
          }

          if (tomorrow) {
            ctx.svesp = 1;
            if (!/196|Trident/.test(version) && /Completorium/i.test(hora) && month === 11 && ((day === 1 && dayofweek !== 0) || (day === 2 && dayofweek === 1))) {
              srankA[2] = 7;
              srank = srank.replace(/;;[0-9]/, ';;7');
              ctx.error += hora;
            } else if (/196/.test(version) && month === 11 && day === 1) {
              srankA[2] = 1;
              srank = '';
            } else if (!/196/.test(version) && T(srank) && (/Quadp3\-3/i.test(tname) || /Quad6\-[1-3]/i.test(tname))) {
              srankA[2] = 1.1;
            } else if (month === 12 && day === 23) {
              srank = '';
              saint = EMPTY;
              sname = '';
              srankA = [];
            }
          } else if (/(Vespera|Completorium)/i.test(hora)) {
            ctx.svesp = 3;
            if (
              (/No secunda Vespera/i.test(S(saint.get('Rule'))) && !/196/.test(version)) ||
              (/vigilia/i.test(srank) && (!/196/.test(version) || !/08\-09/.test(sname))) ||
              (!/1960|Trident/.test(version) && /Completorium/i.test(hora) && month === 11 && day === 1 && dayofweek !== 6) ||
              (N(srankA[2]) < 2 && T(trank) && !(month === 1 && day > 6 && day < 13)) ||
              (/1955|Monastic.*Divino|1963/.test(version) && N(srankA[2]) >= 2.2 && N(srankA[2]) < 2.9 && /Semiduplex/i.test(S(srankA[1])))
            ) {
              srank = '';
              saint = EMPTY;
              sname = '';
              srankA = [];
            } else if ((!/196/.test(version) || dayofweek === 6) && month === 11 && /Omnium Fidelium defunctorum/i.test(srank) && !T(caller)) {
              srankA[2] = 1;
              srank = '';
            } else if (!/196/.test(version) && T(srank) && (/Quadp3\-3/i.test(tname) || /Quad6\-[1-3]/i.test(tname))) {
              // (Perl: commented out)
            }
          } else {
            ctx.svesp = 2; // no Vespers
          }

          const t2 = N(trankA[2]);
          const s2 = N(srankA[2]);
          if (
            (t2 >= (/19(?:55|6)/i.test(version) ? 6 : 7) && s2 < 6) ||
            (!/Dominica(?!.*Trinitatis)|Feria|Sabbato|In Octava/i.test(trank) &&
              ((t2 >= 6 && s2 < 2.1) || (t2 >= 5 && s2 === 2 && /infra octavam|post Octavam Asc|Vigilia Pent/i.test(S(srankA[2]))))) ||
            (/19(?:55|6)/i.test(version) &&
              ((/vigil/i.test(srank) && dayofweek === 0 && month < 12) || (/(infra octavam|in octava)/i.test(srank) && nooctnat()))) ||
            (/1960/.test(version) && dayofweek === 0 && ((t2 >= 6 && s2 < 6) || (t2 >= 5 && s2 < 5)))
          ) {
            srank = '';
            saint = EMPTY;
            sname = '';
            srankA = [];
            commemoentries = [];
          } else if (
            /196/.test(version) &&
            ((N(srankA[2]) >= 6 && N(trankA[2]) < 6 && !(N(trankA[2]) === 2.1 || N(trankA[2]) === 3.9 || N(trankA[2]) === 4.9 || /Dominica/i.test(S(trankA[0])))) ||
              (/Dominica/i.test(S(trankA[0])) && !/Nat1/i.test(S(ctx.dayname[0])) && N(trankA[2]) <= 5 && N(srankA[2]) >= 5 && /Festum Domini/i.test(S(saint.get('Rule')))))
          ) {
            tname = trank = '';
            trankA = [];
            tempora = EMPTY;
          } else if (/1955|Monastic.*Divino|1963/.test(version) && N(srankA[2]) >= 2.2 && N(srankA[2]) < 2.9 && /Semiduplex/i.test(S(srankA[1]))) {
            srankA[2] = /Monastic/i.test(version) ? 1.1 : 1.2;
          }
        } else {
          srank = '';
          saint = EMPTY;
          sname = '';
          srankA = [];
        }
        ctx.commemoentries = commemoentries;
      }
      let commemoentries = ctx.commemoentries;
      ctx.transfervigil = transfervigil = ctx.transfervigil;

      // In Festo Sanctae Mariae Sabbato according to the rubrics.
      // (Perl tests `!$tommorow`, a misspelt undefined variable, so that term is always true.)
      if (dayofweek === 6 && N(trankA[2]) < 1.4 && N(srankA[2]) < 1.4 && !T(ctx.transfervigil) && ctx.testmode !== 'Sanctoral') {
        if (!tomorrow) ctx.scriptura = tname;
        if (N(trankA[2]) === 1.15) {
          tname = tname.replace(/\.txt$/, '');
          commemoentries.unshift(tname);
          ctx.commemoratio = tname;
          ctx.comrank = trankA[2];
        }
        trank = 'Sanctæ Mariæ Sabbato;;Simplex;;1.3;;vide ' + ctx.C10;
        tempora.set('Rank', trank);
        tname = subdirname('Commune', version) + ctx.C10 + '.txt';
        trankA = perlSplit(trank, ';;');
      }

      if (/Trid/i.test(version) && ((N(trankA[2]) < 5.1 && N(trankA[2]) > 4.2 && /Dominica/i.test(S(trankA[0])) && !/altovadensis/i.test(version)) || (/infra octavam Corp/i.test(S(trankA[0])) && !/Cist/i.test(version)))) {
        trankA[2] = 2.9;
      } else if (/divino|altovadensis/i.test(version) && N(trankA[2]) < 5.1 && /Dominica/i.test(S(trankA[0]))) {
        trankA[2] = /divino/i.test(version) ? 4.9 : 3.9;
      } else if (/196/.test(version) && /Nat1/i.test(tname) && day > 28) {
        sname = subdirname('Tempora', version) + 'Nat' + day;
        saint = off(ss.setupstring('Latin', sname));
        srank = S(saint.get('Rank'));
        srankA = perlSplit(srank, ';;');
      } else if (/Adv|Quad/.test(S(ctx.dayname[0])) && N(srankA[2]) > 6 && !/12-24/.test(sname) && !/Patronus/.test(S(saint.get('Rule')))) {
        srankA[2] = 6.01;
      }

      if (/Epi1\-0/i.test(tname) && N(srankA[2]) === 5.6) srankA[2] = 2.9;

      // Sort out occurrence between the sanctoral and temporal cycles.
      let sanctoraloffice;
      if (!N(srankA[2]) || (/19(?:55|6)|Monastic.*Divino/i.test(version) && N(srankA[2]) <= 1.1) || /Sanctæ Mariaæ Sabbato/i.test(S(trankA[0]))) {
        sanctoraloffice = 0;
      } else if (N(srankA[2]) > N(trankA[2])) {
        sanctoraloffice = 1;
      } else if (/Dominica/i.test(S(trankA[0])) && !/Nat1/i.test(S(ctx.dayname[0]))) {
        if (/196/.test(version)) {
          if (N(trankA[2]) <= 5 && (N(srankA[2]) >= 6 || (N(srankA[2]) >= 5 && /Festum Domini/i.test(S(saint.get('Rule')))))) sanctoraloffice = 1;
          else if (/Conceptione Immaculata/.test(S(srankA[0]))) sanctoraloffice = 1;
          else sanctoraloffice = 0;
        } else if (/Festum Domini/i.test(S(saint.get('Rule'))) && N(srankA[2]) >= 2 && N(trankA[2]) <= 5) {
          sanctoraloffice = 1;
          srankA[2] = 4.9 + N(srankA[2]) / 100;
        } else sanctoraloffice = 0;
      } else if (ctx.missa && srankA[1] === 'Vigilia' && /Advent/.test(S(trankA[0])) && !/Quatt?uor/.test(S(trankA[0]))) {
        sanctoraloffice = 1;
      } else sanctoraloffice = 0;
      ctx.sanctoraloffice = sanctoraloffice;

      const communesNames = () => {
        const c = S(ss.getdialog('communes')).replace(/\n/g, '');
        const parts = c.split(',');
        const h = {};
        for (let i = 0; i < parts.length; i += 2) h[parts[i]] = parts[i + 1];
        return h;
      };

      let rank;
      let commemoratio = ctx.commemoratio;
      let comrank = ctx.comrank;
      let winner;
      let scriptura = ctx.scriptura;
      let laudesonly = ctx.laudesonly;
      let commemorated = ctx.commemorated;
      let communetype = ctx.communetype;
      let commune = ctx.commune;
      let vespera, cvespera = ctx.cvespera;

      if (sanctoraloffice) {
        rank = srankA[2];
        officename[1] = `${S(srankA[0])} ${S(srankA[1])}`;
        winner = sname;
        vespera = ctx.svesp;

        {
          const [nct, nc] = extract_common(srankA[3], rank, version, /Pasc/.test(S(ctx.dayname[0])));
          communetype = nct;
          commune = nc;
        }
        let cm;
        if (/^(ex|vide)\s*(C[0-9]+[a-z]*)/i.test(S(srankA[3]))) {
          const names = communesNames();
          cm = /^.*(C\d.*)\.txt/.exec(S(commune));
          officename[1] += ` ${S(communetype)} ${S(names[cm ? cm[1] : undefined])} [${S(commune)}]`;
        }

        if (/01-12t/.test(winner) && /laudes/i.test(hora)) {
          commemoentries.unshift('Sancti/01-06.txt');
          commemoratio = 'Sancti/01-06.txt';
          comrank = 5.6;
        } else if (
          N(srankA[2]) < 7 && !/01-01/.test(sname) &&
          (N(trankA[2]) >= (N(srankA[2]) >= 5 ? 2.1 : 1.5) || (/cist/i.test(version) && N(trankA[2]) === 1.15)) &&
          !(/Sangu/i.test(S(srankA[0])) && /Cor[dp]/i.test(S(trankA[0])))
        ) {
          commemoentries.unshift(tname);
          commemoratio = tname;
          comrank = trankA[2];
          cvespera = ctx.tvesp;
          officename[2] = `Commemoratio: ${S(trankA[0])}`;
          if (/Pasc5\-[13]/i.test(tfile)) officename[2] = officename[2].replace(/:/, ' ad Laudes & Matutinum:');
          if (/Quattuor.*Sept/.test(S(trankA[0]))) officename[2] = officename[2].replace(/:/, ' ad Laudes tantum:');
        } else if (T(commemoentries[0])) {
          const transferedC = commemoentries[0];
          commemoratio = transferedC + '.txt';
          const tc = off(ss.setupstring('Latin', transferedC + '.txt'));
          const cr = perlSplit(S(tc.get('Rank')), ';;');
          if (!(!/196/.test(version) && ctx.svesp === 3 && N(cr[2]) < 2)) {
            comrank = cr[2];
            cvespera = ctx.svesp;
            officename[2] = `Commemoratio: ${S(cr[0])}`;
            if (/196/i.test(version)) {
              if (N(cr[2]) < 6) officename[2] = officename[2].replace(/:/, ' ad Laudes tantum:');
            } else if (!/trident/i.test(version) && N(srankA[2]) >= 6) {
              if (N(cr[2]) < 4.2 && N(cr[2]) !== 2.1 && !/infra octavam|post Octavam Asc|Vigilia Pent/i.test(S(srankA[0]))) officename[2] = officename[2].replace(/:/, ' ad Laudes tantum:');
            } else if (N(srankA[2]) >= 6 && !/in.*octava|post Octavam Asc|Vigilia Pent/i.test(S(srankA[0])) && N(cr[2]) < 3.1 && N(cr[2]) !== 2.999) {
              commemoratio = '';
              comrank = 0;
              commemoentries = [];
              officename[2] = '';
            } else if (N(srankA[2]) >= 5 && N(cr[2]) < 2 && !/infra octavam|post Octavam Asc|Vigilia Pent/i.test(S(srankA[0]))) {
              officename[2] = officename[2].replace(/:/, ' ad Laudes & Matutinum:');
            }
          }
        } else if (T(transferedName)) {
          if (!/Vespera|Completorium/i.test(hora)) {
            const t = ss.officestring('Latin', transferedName + '.txt');
            if (t) {
              const tr = perlSplit(S(t.get('Rank')), ';;');
              officename[2] = `Transfer: ${S(tr[0])}`;
            } else officename[2] = `Transfer: ${tday} file not found`;
          }
          commemoratio = '';
          comrank = 0;
        } else {
          comrank = 0;
          commemoratio = '';
        }

        if (!T(officename[2]) && T(ctx.transfervigil)) {
          const vw = off(ss.setupstring('Latin', ctx.transfervigil));
          if (!vw.isEmpty && vw.keys().length) {
            const o = S(vw.get('Oratio Vigilia'));
            const mm = /!.*?(Vigilia .*)/.exec(o);
            if (mm) officename[2] = `Commemoratio: ${mm[1]}`;
          }
        }

        if (!T(officename[2]) && (saint.has('Commemoratio 2') || saint.has('Commemoratio'))) {
          const sc = T(saint.get('Commemoratio 2')) ? saint.get('Commemoratio 2') : saint.get('Commemoratio');
          let line = S(sc).split(/\n/)[0];
          let mm2;
          if ((mm2 = /@([a-z0-9/\-]+?):/i.exec(line))) {
            const s2 = off(ss.setupstring('Latin', mm2[1] + '.txt'));
            line = '!Commemoratio ' + S(s2.get('Officium'));
          }
          if (/^!Commemoratio /.test(line)) {
            officename[2] = 'Commemoratio: ' + line.replace(/^!Commemoratio /, '');
            if ((N(srankA[2]) >= 5 && T(saint.get('Commemoratio 2'))) || /196/.test(version)) officename[2] = officename[2].replace(/:/, ' ad Laudes tantum:');
          }
        }

        if ((/matutinum/i.test(hora) || (!T(officename[2]) && !/Vespera|Completorium/i.test(hora))) && N(rank) < 7 && T(trankA[0]) && !ctx.missa) {
          const scrip = off(ss.officestring('Latin', tname));
          if (
            !(saint.has('Lectio1') && (!/Lectio1 Quad/i.test(S(saint.get('Rule'))) || /Quad(\d|p3\-[3456])/i.test(tname))) &&
            scrip.has('Lectio1') &&
            !/evangelii/i.test(S(scrip.get('Lectio1'))) &&
            (!/\;\;ex /.test(S(saint.get('Rank'))) || (/trident/i.test(version) && !/\;\;(vide|ex) /i.test(S(saint.get('Rank')))) || /Lectio1 temp/i.test(S(saint.get('Rule'))))
          ) {
            const ittable = initiarule(month, day, year);
            if (T(ittable) && !/\~[A]$/.test(ittable)) {
              const tsfile = subdirname('Tempora', version) + ittable.split('~')[0] + '.txt';
              const tscrip = off(ss.officestring('Latin', tsfile));
              let tsrank = S(T(tscrip.get('Rank')) ? tscrip.get('Rank') : tscrip.get('Scriptura'));
              tsrank = tsrank.replace(/\s*;;.*|\s*$/s, '');
              if (!new RegExp(tfile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(tsfile) && T(tsrank)) officename[2] = `Tempora: ${S(trankA[0])} (Scriptura ut in: ${tsrank})`;
            } else if (!/monastic/i.test(version) || !/(?:Pasc|Pent)/.test(tname) || month > 10) {
              officename[2] = `Tempora: ${S(trankA[0])}`;
            } else {
              officename[2] = `Scriptura: ${S(trankA[0])}`;
            }
          } else {
            officename[2] = `Tempora: ${S(trankA[0])}`;
          }
          scriptura = tname;
        } else if (ctx.missa) {
          scriptura = tname;
        }
      } else {
        // winner is Tempora
        if (!/Vespera/i.test(hora) && N(trankA[2]) < (/cist/i.test(version) ? 1.25 : 1.5) && T(ctx.transfervigil)) {
          const t = ctx.transfervigil;
          const w = ss.setupstring('Latin', t);
          if (w && w.keys().length) {
            tname = t;
            trank = S(w.get('Rank'));
            trankA = perlSplit(trank, ';;');
          }
        }
        rank = trankA[2];
        officename[1] = `${S(trankA[0])}\t${S(trankA[1])}`;
        winner = tname;
        vespera = ctx.tvesp;

        {
          const [nct, nc] = extract_common(trankA[3], rank, version, /Pasc/.test(S(ctx.dayname[0])));
          communetype = nct;
          commune = nc;
        }
        if (/^(ex|vide)\s*(C[0-9]+[a-z]*)/i.test(S(trankA[3]))) {
          const names = communesNames();
          officename[1] += ` ${S(communetype)} ${S(names[commune])} [${S(commune)}]`;
        }

        if (/1960/.test(version) && vespera === 1 && N(rank) >= 6 && N(comrank) < 5) {
          commemoratio = '';
          srankA[2] = 0;
          commemoentries = [];
        }

        ctx.winner = winner;
        ctx.rank = rank;
        ctx.sname = sname;
        let climit = climit1960(sname);

        if (/vigil/i.test(S(srankA[0])) && !/Epiph/i.test(S(srankA[0]))) {
          laudesonly =
            /(Adv|Quad[0-6])/i.test(S(ctx.dayname[0])) || (/Quadp3/i.test(S(ctx.dayname[0])) && dayofweek >= 4) || (/Quadp/i.test(S(ctx.dayname[0])) && /Monastic.*Divino/i.test(version)) || /Quattuor Temporum Sept/.test(S(trankA[0]))
              ? ' ad Missam tantum'
              : ' ad Laudes tantum';
        } else {
          laudesonly = ctx.missa ? '' : climit === 2 ? ' ad Laudes tantum' : '';
        }

        if ((/Epi1\-0a/.test(winner) || (/Epi1\-0/.test(winner) && /altovadensis/i.test(version))) && (/laudes/i.test(hora) || (vespera === 3 && day !== 12))) {
          commemoentries.unshift('Sancti/01-06.txt');
          commemoratio = 'Sancti/01-06.txt';
          comrank = 5.6;
        } else if (N(srankA[2]) && climit && !/omit.*? commemoratio/i.test(S(tempora.get('Rule'))) && !/No commemoratio/i.test(S(tempora.get('Rule')))) {
          if (/laudes/i.test(hora) || ctx.missa || climit === 1) {
            commemoentries.unshift(sname);
            commemoratio = sname;
            comrank = srankA[2];
            cvespera = ctx.svesp;
          }
          const comm = /^In Commemoratione/.test(S(srankA[0])) ? '' : 'Commemoratio:';
          officename[2] = `${comm} ${S(srankA[0])}`;
          if (/196/i.test(version)) {
            if ((N(trankA[2]) >= 5 && N(srankA[2]) < 2) || climit === 2) officename[2] = officename[2].replace(/:/, ` ${laudesonly}:`);
          } else if (!/trident/i.test(version) && N(trankA[2]) >= 6) {
            if (N(srankA[2]) < 4.2 && N(srankA[2]) !== 2.1 && !/infra octavam|Vigilia Pent|cinerum|majoris hebd|in Octava|Albis|Quattuor Temporum Pentecostes/i.test(S(trankA[0])) && !/Adv|Quad/i.test(tname)) officename[2] = officename[2].replace(/:/, ' ad Laudes tantum:');
          } else if (T(laudesonly)) {
            officename[2] = officename[2].replace(/:/, ` ${laudesonly}:`);
          } else if (N(trankA[2]) >= 5 && N(srankA[2]) < 2 && !/infra octavam|Vigilia Pent|cinerum|majoris hebd|in Octava|Albis/i.test(S(trankA[0])) && !/Adv|Quad/i.test(tname)) {
            officename[2] = officename[2].replace(/:/, ' ad Laudes & Matutinum:');
          }
          if (/196/i.test(version) && /Januarii/i.test(officename[2])) officename[2] = '';
        } else if (T(commemoentries[0]) && !/omit.*? commemoratio/i.test(S(tempora.get('Rule'))) && !/No commemoratio/i.test(S(tempora.get('Rule')))) {
          const transferedC = commemoentries[0];
          commemoratio = transferedC + '.txt';
          climit = climit1960(commemoratio);
          if (climit) {
            laudesonly = ctx.missa ? '' : climit === 2 ? ' ad Laudes tantum' : '';
            const tc = off(ss.setupstring('Latin', commemoratio));
            const cr = perlSplit(S(tc.get('Rank')), ';;');
            comrank = cr[2];
            cvespera = ctx.svesp;
            officename[2] = `Commemoratio: ${S(cr[0])}`;
            if (/196/i.test(version)) {
              if ((N(trankA[2]) >= 5 && N(cr[2]) < 2) || climit === 2) officename[2] = officename[2].replace(/:/, ` ${laudesonly}:`);
            } else if (!/trident/i.test(version) && N(trankA[2]) >= 6) {
              if (N(cr[2]) < 4.2 && N(cr[2]) !== 2.1 && !/infra octavam|Vigilia Pent|cinerum|majoris hebd/i.test(S(trankA[0]))) officename[2] = officename[2].replace(/:/, ' ad Laudes tantum:');
            } else if (T(laudesonly)) {
              officename[2] = officename[2].replace(/:/, ` ${laudesonly}:`);
            } else if (N(trankA[2]) >= 5 && N(cr[2]) < 2 && !/infra octavam|Vigilia Pent|cinerum|majoris hebd/i.test(S(trankA[0]))) {
              officename[2] = officename[2].replace(/:/, ' ad Laudes & Matutinum:');
            }
          } else {
            commemoratio = '';
            commemoentries = [];
          }
        } else if (T(transferedName)) {
          if (!/Vespera|Completorium/i.test(hora)) {
            const t = ss.officestring('Latin', transferedName + '.txt');
            if (t) {
              const tr = perlSplit(S(t.get('Rank')), ';;');
              officename[2] = `Transfer: ${S(tr[0])}`;
            } else officename[2] = `Transfer: ${transferedName} file not found`;
          }
          commemoratio = '';
          comrank = 0;
        } else {
          commemoratio = '';
          comrank = 0;
        }

        if (!T(commemoratio) && T(sname)) {
          // if only a Vigil to be commemorated
          sname = sname.replace(/v\./, '.');
          const s = off(ss.setupstring('Latin', sname));
          if (/Vigil/i.test(S(s.get('Rank'))) && s.has('Commemoratio')) commemorated = sname;
          if (/Vigil/i.test(S(s.get('Rank'))) && s.has('Commemoratio 2')) commemorated = sname;
        }

        if (!(T(officename[2]) || ctx.missa)) {
          const ittable = initiarule(month, day, year);
          if (T(ittable) && !/\~[A]$/.test(ittable)) {
            const tsfile = subdirname('Tempora', version) + ittable.split('~')[0] + '.txt';
            const tscrip = off(ss.officestring('Latin', tsfile));
            let tsrank = S(T(tscrip.get('Rank')) ? tscrip.get('Rank') : tscrip.get('Scriptura'));
            tsrank = tsrank.replace(/\s*;;.*|\s*$/s, '');
            officename[2] = `Scriptura ut in: ${tsrank}`;
          }
        }
      }

      if (month === 1 && day < 14 && !/Epi/i.test(S(officename[0]))) officename[0] = 'Nat' + day;

      if (tomorrow) ctx.tomorrowname = officename;
      else ctx.dayname = officename;

      if (/trident/i.test(version) && /ex/i.test(S(communetype)) && N(rank) < 1.5) communetype = 'vide';

      Object.assign(ctx, {
        winner, rank, commemoratio, comrank: S(comrank).replace(/\s*/g, ''), commune, communetype, scriptura, laudesonly, commemorated,
        vespera, cvespera, tname, sname, trank: trankA, srank: srankA, commemoentries, tempora, saint, transfervigil: ctx.transfervigil
      });
    }

    // Perl: ($trank[0] =~ /infra Octavam (.*)/i && $ctrank[0] =~ /in Octava (.*)/i && $1 eq $2).
    // After the second successful match $1 is that match's group and $2 is undefined, so the test
    // is true only when that captured group is empty.
    function octavaNamesEqual() {
      if (!/infra Octavam (.*)/i.test(S(ctx.trank[0]))) return false;
      const m2 = /in Octava (.*)/i.exec(S(Array.isArray(ctx.ctrank) ? ctx.ctrank[0] : ''));
      return !!m2 && m2[1] === '';
    }

    // ------------------------------------------------------------------ concurrence (Vespers, Compline)
    // Port of concurrence() from horascommon.pl. "Tomorrow's" office is worked out first, then today's;
    // the two are compared to decide whose Vespers it is and what is commemorated. Variables named
    // c... belong to tomorrow's office. (The Perl uses an undeclared $weekname in one test; it is
    // always undefined there, so that term is false.)
    function concurrence(day, month, year, version, dioecesis) {
      const hora = ctx.hora;
      occurrence(day, month, year, version, dioecesis, 1);
      ctx.cwinner = ctx.winner;
      ctx.crank = ctx.rank;
      let ccomrank = ctx.comrank;
      const ccommune = ctx.commune;
      const ccommunetype = ctx.communetype;
      ctx.ctrank = ctx.trank.slice();
      ctx.csrank = ctx.srank.slice();
      ctx.ccommemoentries = (ctx.commemoentries || []).slice();
      ctx.ctname = ctx.tname;
      ctx.csname = ctx.sname;
      ctx.csanctoraloffice = ctx.sanctoraloffice;
      ctx.ctempora = ctx.tempora;
      ctx.csaint = ctx.saint;
      let cwinnerH = ctx.csanctoraloffice ? ctx.csaint : ctx.ctempora;
      let cwrank = (ctx.csanctoraloffice ? ctx.csrank : ctx.ctrank).slice();

      occurrence(day, month, year, version, dioecesis, 0);
      let winnerH = ctx.sanctoraloffice ? ctx.saint : ctx.tempora;
      ctx.winnerHash = winnerH;
      let wrank = (ctx.sanctoraloffice ? ctx.srank : ctx.trank).slice();
      const dn0 = S(ctx.dayname[0]);
      const dayofweek = ctx.dayofweek;
      const RULE = (h) => S(h.get('Rule'));
      const RANK = (h) => S(h.get('Rank'));
      const noop = () => {};

      // (cwinner is rebuilt as a plain object when "emptied": the Perl assigns {} or ())
      const emptyH = EMPTY;
      let rank = ctx.rank;

      if (/No secunda Vespera/i.test(RULE(winnerH)) && !/196[03]/i.test(version)) {
        wrank = [];
        winnerH = emptyH;
        ctx.winner = '';
        rank = 0;
      } else if (/Quadp3/.test(dn0) && dayofweek === 3 && !/1960|1955/.test(version)) {
        rank = wrank[2] = 2.99;
      } else if (/Quad[0-5]|Quadp|Adv|Pasc1/.test(dn0) && dayofweek === 0 && /trident(?!.*altovadensis)/i.test(version)) {
        rank = wrank[2] = 2.99;
      } else if (/Quad[0-5]|Quadp|Adv|Pasc1/.test(dn0) && dayofweek === 0 && /divino|cist/i.test(version)) {
        rank = wrank[2] = /divino/i.test(version) ? 4.9 : 3.9;
      } else if (/(?<!Albis )In Octava/i.test(S(wrank[0])) && (N(rank) > 5 || /Asc|Nat|Cord/i.test(S(wrank[0])))) {
        if (!/Cist/i.test(version)) rank = wrank[2] = 4.99;
      }
      ctx.rank = rank;

      if (/Dominica/i.test(S(cwrank[0])) && !/infra octavam/i.test(S(cwrank[0])) && /semiduplex/i.test(S(cwrank[1])) && !/1955|196/.test(version)) {
        cwrank[2] = ctx.crank = /altovadensis/i.test(version) ? 3.9 : /trident/i.test(version) ? 2.9 : 4.9;
      }

      const trank = ctx.trank;
      if ((/Dominica/i.test(S(cwrank[0])) && /in.*octava/i.test(S(trank[0]))) || (/infra.*octav/i.test(S(cwrank[0])) && /Trident/.test(version))) {
        if (!/196/.test(version)) ctx.octvespera = 3;
        if (/cist/i.test(version) && dayofweek === 6) ctx.octvespera = 1;
      } else if (/in.*octava|Vigilia Pent/i.test(S(cwrank[0])) && (/Dominica/i.test(S(wrank[0])) || (/Sancti/.test(S(ctx.winner)) && !/in.*octava/i.test(S(wrank)))) && /divino/i.test(version)) {
        ctx.octvespera = 1;
      }

      const ctrank = ctx.ctrank;
      if (/(?<!De )Dominica|Trinitatis/i.test(S(ctrank[0])) && !(/19(?:55|6)|altovadensis/i.test(version) && /Dominica Resurrectionis/i.test(S(ctrank[0])))) {
        // tomorrow is a Sunday: today's Tempora is dropped completely
        if (ctx.sanctoraloffice && !/infra octavam Nativitatis$/i.test(S(ctx.srank[0]))) {
          if (/tempora/i.test(S((ctx.commemoentries || [])[0]))) {
            ctx.commemoentries.shift();
            if (ctx.commemoentries.length) {
              ctx.commemoratio = ctx.commemoentries[0];
              const tc = off(ss.setupstring('Latin', ctx.commemoratio));
              const cr = perlSplit(S(tc.get('Rank')), ';;');
              ctx.comrank = cr[2];
            } else {
              ctx.commemoratio = '';
              ctx.comrank = 0;
            }
          }
        } else {
          winnerH = emptyH;
          ctx.winner = '';
          rank = 0;
          ctx.rank = 0;
        }
        ctx.tempora = EMPTY;
        ctx.trank = [''];
        ctx.tname = '';
      }
      ctx.winnerHash = winnerH;

      // (the "weekname" test of the Perl is on an undeclared variable: false)
      const weekname = '';
      const cw = ctx;
      const ctrankNow = ctx.ctrank;
      const cwR = RULE(cwinnerH);
      const cwRank = RANK(cwinnerH);
      if (
        /No prima vespera/i.test(cwR) ||
        (/1955/.test(version) && N(cwrank[2]) < 5) ||
        (/196/.test(version) && !/Barroux/.test(version) && N(cwrank[2]) < (/Dominica/i.test(S(cwrank[0])) || (/Festum Domini/i.test(cwR) && dayofweek === 6) ? 5 : 6)) ||
        (/Barroux/.test(version) && N(cwrank[2]) < 5 && !/C10/.test(cwRank)) ||
        (/Feria|Sabbato|Vigilia|Quat[t]*uor/i.test(cwRank) && !/in Vigilia Epi|in octava|infra octavam|Dominica|C10/i.test(cwRank)) ||
        (/infra octavam|Vigilia Pent/i.test(cwRank) && !/Dominica/i.test(cwRank) && (/trident/i.test(version) || ctx.sanctoraloffice == ctx.csanctoraloffice) && /infra octavam|post Octavam Asc|Quat.*Pent|Dominica (Resurrectionis|Pentecostes)/i.test(RANK(winnerH))) ||
        (/Pasc[07]/i.test(weekname) && !/Dominica/i.test(cwRank)) ||
        (/01-01/.test(S(ctx.winner)) && !/trident/i.test(version)) ||
        (/C10/i.test(cwRank) && /C1[01]/i.test(RANK(winnerH))) ||
        (/19(?:55|6)/i.test(version) && /Dominica Resurrectionis|Patrocinii S. Joseph/i.test(cwRank)) ||
        (/19(?:55|6)/.test(version) && /octav/i.test(cwRank) && !/dominica|cum Octava/i.test(cwRank) && N(cwrank[2]) < 6)
      ) {
        const blank = () => {
          ctx.ctname = '';
          cwinnerH = emptyH;
          cwrank = [];
          ctx.cwinner = '';
          ctx.crank = 0;
          ctx.cvespera = 0;
        };
        if (N(ccomrank) >= (N(rank) >= (/trident/i.test(version) ? 6 : 5) && !/feria|sabbato|octava/i.test(S(cwrank[0])) ? 2.1 : !/cist/i.test(version) ? 1.1 : 1) && !/1.5/.test(String(ccomrank)) && !/1955|196/.test(version)) {
          ctx.vespera = 3;
          ctx.dayname[2] = S(ctx.tomorrowname[2]) + '<br/>Vespera de Officio occurente, Commemoratio Sanctorum crastinorum tantum';
          blank();
        } else if (((ctx.csanctoraloffice && !/infra octavam Epi/i.test(S(cwrank[0]))) || /Nat2-0/i.test(S(ctx.cwinner))) && !/1955|196/.test(version)) {
          ctx.vespera = 3;
          ctx.dayname[2] = S(ctx.dayname[2]) + (ctx.sanctoraloffice ? '<br/>Vespera de Officio occurente; nihil de sequenti' : '<br/>Vespera de Tempore occurente; nihil de sequenti');
          blank();
          ctx.ccommemoentries = [];
        } else {
          ctx.vespera = 3;
          if (!(/Dominica|Advent|Quadr|Pass|Asc/i.test(S(ctx.dayname[2])) || (N(ctx.comrank) >= 2.1 && !/ad Laudes|Rogatio/i.test(S(ctx.dayname[2]))))) ctx.dayname[2] = '';
          if (ctx.sanctoraloffice) { if (!/1955|196/.test(version)) ctx.dayname[2] += '<br/>Vespera de Officio occurente'; }
          else if (!/1955|196/.test(version)) ctx.dayname[2] += '<br/>Vespera de Tempore occurente';
          blank();
          ctx.ccommemoentries = [];
        }
      } else if (!ctx.sanctoraloffice && !ctx.csanctoraloffice && !/C10/.test(S(ctx.cwinner))) {
        // two "concurrent" Tempora
        if (N(ctx.crank) >= N(rank) || /No secunda vespera/i.test(S(ctx.tempora.get('Rule')))) {
          ctx.vespera = 1;
          ctx.tvesp = 1;
          ctx.cvespera = 0;
          ctx.winner = ctx.cwinner;
          if (N(ctx.crank) < 7 && N(ctx.crank) !== 6.5 && N(ctx.crank) !== 6 && N(ctx.comrank) > 2 && !/no commemoratio/i.test(cwR)) {
            const hodie = N(ctx.comrank) >= N(ccomrank) ? 'hodiernorum tantum' : 'tantum';
            ctx.tomorrowname[2] = ctx.dayname[2] = S(ctx.dayname[2]) + `<br/>Vespera de sequenti; Commemoratio Sanctorum ${hodie}`;
          } else {
            ctx.tomorrowname[2] = S(ctx.tomorrowname[2]) + '<br/>Vespera de sequenti.';
            ctx.commemoentries = [];
            ctx.commemoratio = '';
          }
          ctx.dayname = ctx.tomorrowname.slice();
          rank = ctx.crank;
          ctx.rank = rank;
          ctx.commune = ccommune;
          ctx.communetype = ccommunetype;
          ctx.cwinner = '';
          cwinnerH = emptyH;
        } else {
          ctx.vespera = 3;
          ctx.tvesp = 3;
          ctx.dayname[2] = S(ctx.dayname[2]) + '<br/>Vespera de Tempore præcedenti; nihil de sequenti';
          ctx.ctrank = '';
          ctx.ctname = '';
          cwinnerH = emptyH;
          cwrank = [];
          ctx.cwinner = '';
          ctx.crank = 0;
          ctx.cvespera = 0;
        }
      } else {
        const crank = N(ctx.crank);
        // "flattened" ranks: only differ from the real ones for the older rubrics
        const flrank = rank;
        const flcrank = ctx.crank;
        const wR = RULE(winnerH);
        if (
          (N(rank) >= ((/19(?:55|6)/.test(version) && !/Barroux/.test(version) && dayofweek < 6) ? 6 : 7) && crank < 6) ||
          (/196/.test(version) && /Dominica/i.test(cwRank) && !/Nat1/i.test(dn0) && crank <= 5 && N(rank) >= 5 && /Festum Domini/i.test(wR)) ||
          (N(rank) >= (/cist/i.test(version) ? 7 : /trident/i.test(version) ? 6 : 5) && !/feria|in.*octava/i.test(S(ctx.winner)) && crank < 2.1) ||
          (/Pent02-5/.test(S(ctx.winner)) && /07-01\./.test(S(ctx.cwinner)))
        ) {
          ctx.dayname[2] = S(ctx.dayname[2]) + '<br/>Vespera de præcedenti; nihil de sequenti';
          ctx.cwinner = '';
          cwinnerH = emptyH;
          ctx.vespera = 3;
          ctx.crank = 0;
          ctx.cvespera = 0;
          ctx.ccommemoentries = [];
          ccomrank = 0;
        } else if (
          (N(rank) < 2 && !(N(rank) === 1.15 && /tempora/i.test(S(ctx.winner)))) ||
          (/196/.test(version) && (/Dominica/i.test(S(cwrank[0])) || /Festum Domini/i.test(cwR)) && (N(rank) < (crank >= 6 ? 6 : 5) || /Dominica/i.test(S(wrank[0])) || /Festum Domini/i.test(wR))) ||
          (crank >= 6 && !(N(rank) === 1.15 || N(rank) === 2.1 || N(rank) === 2.99 || N(rank) === 3.9 || N(rank) >= 4.2) && !/cist/i.test(version) && !/Dominica|feria|in.*octava/i.test(S(cwrank[0]))) ||
          (/12-25|01-01/.test(S(ctx.cwinner)) && !/cist/i.test(version)) ||
          (/12-25/.test(S(ctx.cwinner)) && /cist/i.test(version)) ||
          (crank >= 5 && !(N(rank) === 1.15 || N(rank) === 2.1 || N(rank) >= 2.99) && !/Dominica|feria|in.*octava/i.test(S(cwrank[0])))
        ) {
          ctx.dayname = ctx.tomorrowname.slice();
          ctx.vespera = 1;
          ctx.cvespera = 3;
          const comrank = N(ctx.comrank);
          if ((comrank === 1.15 || comrank === 2.1 || comrank === 2.99 || comrank === 3.9) && !/12-25|01-01/.test(S(ctx.cwinner)) && !(/07-01/.test(S(ctx.cwinner)) && /Sangu|Cor[dp]/.test(S(ctx.trank[0])))) {
            ctx.dayname[2] = S(ctx.dayname[2]) + '<br/>Vespera de sequenti; commemoratio de off. priv. tantum';
          } else {
            ctx.dayname[2] = S(ctx.dayname[2]) + '<br/>Vespera de sequenti; nihil de præcedenti';
            ctx.commemoratio = '';
            ctx.comrank = 0;
            ctx.commemoentries = [];
          }
          rank = ctx.crank;
          ctx.rank = rank;
          ctx.commune = ccommune;
          ctx.communetype = ccommunetype;
          ctx.winner = ctx.cwinner;
          ctx.cwinner = '';
          cwinnerH = emptyH;
        } else if (!/196/.test(version) && /Dominica/i.test(RANK(winnerH)) && !/Nat1/i.test(dn0) && N(rank) <= 5 && crank > 2.1 && /Festum Domini/i.test(cwR)) {
          throw new Error('pre-1960 concurrence branch reached');
        } else if ((!/196/.test(version) && /Dominica/i.test(cwRank) && !/Nat1/i.test(dn0) && crank <= 5 && N(rank) > 2.1 && /Festum Domini/i.test(wR)) || (/196/.test(version) && N(rank) >= crank)) {
          ctx.vespera = 3;
          ctx.cvespera = 1;
          ctx.commemoratio = ctx.cwinner;
          ctx.dayname[2] = `Commemoratio: ${S(cwrank[0])}`;
          ctx.dayname[2] += '<br/>Vespera de præcedenti; commemoratio de sequenti';
          if (/Dominica/i.test(cwRank)) ctx.dayname[2] += ' Dominica';
        } else if (N(flcrank) === N(flrank)) {
          // "flattened" ranks equal => a capitulo
          ctx.commemoratio = ctx.winner;
          ctx.communeHash = (/trident/i.test(version) || N(flrank) >= 5) && T(ctx.commune) ? off(ss.officestring('Latin', ctx.commune, 0)) : EMPTY;
          ctx.tomorrowname[2] = `Commemoratio: ${S(wrank[0])}`;
          const ch = ctx.communeHash;
          ctx.antecapitulum = winnerH.has('Ant Vespera 3') ? winnerH.get('Ant Vespera 3') : winnerH.has('Ant Vespera') ? winnerH.get('Ant Vespera') : ch.has('Ant Vespera 3') ? ch.get('Ant Vespera 3') : ch.has('Ant Vespera') ? ch.get('Ant Vespera') : '';
          if (T(ctx.antecapitulum)) {
            let mm;
            if (!/no Psalm5/i.test(wR) && !/monastic/i.test(version) && ((mm = /Psalm5 Vespera3=([0-9]+)/i.exec(wR)) || (mm = /Psalm5 Vespera3=([0-9]+)/i.exec(RULE(ch))) || (mm = /Psalm5 Vespera=([0-9]+)/i.exec(wR)) || (mm = /Psalm5 Vespera=([0-9]+)/i.exec(RULE(ch))))) {
              ctx.antecapitulum += `\nPsalm5 VesperaAnte=${mm[1]}`;
            }
          }
          ctx.vespera = 1;
          ctx.cvespera = 3;
          ctx.winner = ctx.cwinner;
          ctx.cwinner = ctx.commemoratio;
          ctx.dayname = ctx.tomorrowname.slice();
          rank = ctx.crank;
          ctx.rank = rank;
          ctx.commune = ccommune;
          ctx.communetype = ccommunetype;
          ctx.dayname[2] = S(ctx.dayname[2]) + '<br/>A capitulo de sequenti; commemoratio de præcedenti';
        } else if (crank > N(rank)) {
          ctx.vespera = 1;
          ctx.commemoratio = ctx.winner;
          ctx.cvespera = 3;
          ctx.tomorrowname[2] = `Commemoratio: ${S(wrank[0])}`;
          ctx.winner = ctx.cwinner;
          ctx.cwinner = ctx.commemoratio;
          ctx.dayname = ctx.tomorrowname.slice();
          rank = ctx.crank;
          ctx.rank = rank;
          ctx.commune = ccommune;
          ctx.communetype = ccommunetype;
          ctx.dayname[2] = S(ctx.dayname[2]) + '<br/>Vespera de sequenti; commemoratio de præcedenti';
        } else {
          ctx.commemoratio = ctx.cwinner;
          ctx.dayname[2] = `Commemoratio: ${S(cwrank[0])}`;
          ctx.vespera = 3;
          ctx.cvespera = 1;
          ctx.dayname[2] += '<br/>Vespera de præcedenti; commemoratio de sequenti';
          if (/infra octavam|post Octavam Asc|Vigilia Pent/i.test(cwRank) || /infra octavam|post Octavam Asc|Vigilia Pent/i.test(S((ctx.ccommemoentries || [])[0]))) {
            const comentries = [];
            for (let commemo of ctx.commemoentries || []) {
              if (!store.exists('Latin', commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
              const cstr = off(ss.officestring('Latin', commemo, 0));
              if (!(cstr.isEmpty || !cstr.keys().length || (/infra octavam|post Octavam Asc|Vigilia Pent/i.test(S(cstr.get('Rank'))) && !/Dominica/i.test(S(cstr.get('Rank')))))) comentries.push(commemo);
            }
            ctx.commemoentries = comentries;
          }
        }
      }

      // Some branches swap "winner"; keep the hash in step with it
      if (!/C12/i.test(S(ctx.votive))) {
        // winnerHash is recomputed from ctx.winner by precedence()
      }
      ctx.cwinnerHash = EMPTY; // Perl's global %cwinner (the lexical of the same name is separate)
      ctx.cwinnerLocal = cwinnerH;
      ctx.cwrank = cwrank;

      if (/completorium/i.test(hora)) ctx.dayname[2] = '';

      // Restrict commemorations according to the respective rubrics
      const dn = ctx;
      const rankNow = N(ctx.rank);
      if (ctx.vespera === 3) {
        let ranklimit = rankNow >= (/trident/i.test(version) ? 6 : 5) && !/Dominica|feria|in.*octava/i.test(S(wrank[0])) ? 2.1 : 1.1;
        if (/cist/i.test(version)) ranklimit = 1;
        let comentries = [];
        for (let commemo of ctx.ccommemoentries || []) {
          if (!store.exists('Latin', commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
          const cstr = off(ss.officestring('Latin', commemo, 1));
          if ((/tempora/i.test(commemo) || /infra octavam|post Octavam Asc|Vigilia Pent/i.test(S(cstr.get('Rank')))) && !/Dominica/i.test(S(cstr.get('Rank')))) continue;
          if (!cstr.isEmpty && cstr.keys().length) {
            const cr = perlSplit(S(cstr.get('Rank')), ';;');
            if (!(N(cr[2]) < ranklimit || /No prima vespera/i.test(S(cstr.get('Rule'))) || /1955|196/.test(version))) comentries.push(commemo);
          }
        }
        ctx.ccommemoentries = comentries;
        ranklimit = /Dominica|feria|in.*octava/i.test(S(wrank[0])) || /cist/i.test(version) ? 2 : rankNow >= 6 ? (!/trident/i.test(version) ? 4.2 : 3.1) : rankNow >= 5 ? 2.1 : 2;
        comentries = [];
        for (let commemo of ctx.commemoentries || []) {
          if (/tempora/i.test(commemo) && ((N(ctx.trank[2]) < 2 && N(ctx.trank[2]) !== 1.15) || /Rogatio|Quattuor.*Sept/i.test(S(ctx.trank[0])))) continue;
          if (!store.exists('Latin', commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
          const cstr = off(ss.officestring('Latin', commemo, 0));
          if (!cstr.isEmpty && cstr.keys().length) {
            const cr = perlSplit(S(cstr.get('Rank')), ';;');
            if (!((N(cr[2]) < ranklimit && !(N(cr[2]) === 1.15 || N(cr[2]) === 2.1 || N(cr[2]) === 2.99 || N(cr[2]) === 3.9)) || /No secunda vespera/i.test(S(cstr.get('Rule'))))) comentries.push(commemo);
          }
        }
        ctx.commemoentries = comentries;
      } else {
        let ranklimit = rankNow >= 6 && !/Dominica|feria|in.*octava/i.test(S(cwrank[0])) ? 4.2 : rankNow >= 5 && !/Dominica|feria|in.*octava/i.test(S(cwrank[0])) ? 2.99 : 2;
        if (rankNow >= 5 && !/Dominica|feria|in.*octava/i.test(S(cwrank[0])) && /cist/i.test(version)) ranklimit = 2.1;
        let comentries = [];
        for (let commemo of ctx.commemoentries || []) {
          if (/tempora/i.test(commemo) && N(ctx.trank[2]) !== 1.15 &&
            (N(ctx.trank[2]) < 2 || /Rogatio|Quattuor.*Sept/i.test(S(ctx.trank[0])) || octavaNamesEqual())) continue;
          if (!store.exists('Latin', commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
          const cstr = off(ss.officestring('Latin', commemo, 0));
          if (!cstr.isEmpty && cstr.keys().length) {
            const cr = perlSplit(S(cstr.get('Rank')), ';;');
            if (!((N(cr[2]) < ranklimit && !(N(cr[2]) === 1.15 || N(cr[2]) === 2.1 || N(cr[2]) === 2.99 || N(cr[2]) === 3.9)) || /No secunda vespera/i.test(S(cstr.get('Rule'))) || /De VII di|Die VII infra/i.test(S(cr[0])))) comentries.push(commemo);
          }
        }
        ctx.commemoentries = comentries;
        ranklimit = /Dominica|feria|in.*octava/i.test(S(cwrank[0])) ? (!/cist/i.test(version) ? 1.1 : 1) : rankNow >= 6 ? (!/trident/i.test(version) ? 4.2 : !/cist/i.test(version) ? 3.1 : 2.2) : rankNow >= 5 ? 2.2 : !/cist/i.test(version) ? 1.1 : 1;
        comentries = [];
        for (let commemo of ctx.ccommemoentries || []) {
          if (!store.exists('Latin', commemo) && !/txt$/i.test(commemo)) commemo += '.txt';
          const cstr = off(ss.officestring('Latin', commemo, 1));
          if ((/tempora/i.test(commemo) || /infra octavam/i.test(S(cstr.get('Rank')))) && !/Dominica/i.test(S(cstr.get('Rank')))) continue;
          if (!cstr.isEmpty && cstr.keys().length) {
            const cr = perlSplit(S(cstr.get('Rank')), ';;');
            if (!(N(cr[2]) < ranklimit || /No prima vespera/i.test(S(cstr.get('Rule'))) || (/1955|196/.test(version) && !/Dominica/i.test(S(cstr.get('Rank')))) ||
              (/Feria|Sabbato|Vigilia|Quat[t]*uor Temp/i.test(S(cstr.get('Rank'))) && !/in Vigilia Epi|in octava|Dominica/i.test(S(cstr.get('Rank')))))) comentries.push(commemo);
          }
        }
        ctx.ccommemoentries = comentries;
      }
    }

    // ------------------------------------------------------------------ precedence (non-Vespers view)
    function precedence(date) {
      resetState();
      ss.clearCache(); // conditionals are evaluated when a file is parsed, so the cache is per date
      const d1 = String(date).replace(/\//g, '-');
      const [month, day, year] = d1.split('-').map(Number);
      Object.assign(ctx, { month, day, year });
      ctx.dayofweek = D.day_of_week(day, month, year);
      ctx.dayname = [D.getweek(day, month, year, 0, ctx.missa), '', ''];

      ctx.C10 =
        'C10' + (/Adv/i.test(ctx.dayname[0]) ? 'a' : month === 1 || (month === 2 && day === 1) ? 'b' : /(Epi|Quad)/i.test(ctx.dayname[0]) ? 'c' : /Pasc/i.test(ctx.dayname[0]) ? 'Pasc' : '');

      const version = ctx.version;
      if (/vespera|completorium/i.test(ctx.hora) && !/C12/i.test(S(ctx.votive))) {
        concurrence(day, month, year, version, ctx.dioecesis);
      } else {
        occurrence(day, month, year, version, ctx.dioecesis, 0);
      }

      const dn1 = S(ctx.dayname[1]);
      if (dn1 && !/duplex/i.test(dn1)) ctx.duplex = 1;
      else if (/semiduplex/i.test(dn1)) ctx.duplex = 2;
      else ctx.duplex = 3;
      ctx.rule = ctx.communerule = '';

      if (T(ctx.winner)) {
        const flag = /tempora/i.test(ctx.winner) && ctx.vespera === 1 ? 1 : 0;
        ctx.winnerHash = off(ss.officestring('Latin', ctx.winner, flag));
        ctx.rule = S(ctx.winnerHash.get('Rule'));
        if (/12-28/.test(ctx.winner) && ctx.dayofweek === 0) ctx.rule = ctx.rule.replace(/no Te Deum/, '');
      }

      if (!/196/.test(version) && ctx.winnerHash.has('Oratio Vigilia') && ctx.dayofweek !== 0 && /Laudes/i.test(ctx.hora)) ctx.transfervigil = ctx.winner;

      // Restrict/Add commemorations
      if (/Sancti/.test(S(ctx.winner)) && /Tempora none/i.test(ctx.rule)) {
        ctx.commemoratio = ctx.scriptura = ctx.dayname[2] = '';
        ctx.commemoentries = [];
      }
      if (!/1960/.test(version) && /Vespera/.test(ctx.hora) && month === 1 && day === 3 && ctx.dayofweek === 6) ctx.commemoratio1 = 'Sancti/01-04.txt';
      if (/1960/.test(version) && /No Sunday commemoratio/i.test(S(ctx.winnerHash.get('Rule'))) && ctx.dayofweek === 0) {
        ctx.commemoratio = ctx.commemoratio1 = ctx.dayname[2] = '';
        ctx.commemoentries = [];
      }

      if (T(ctx.commemoratio)) {
        const flag = /tempora/i.test(ctx.commemoratio) && ctx.tvesp === 1 ? 1 : 0;
        ctx.commemoratioHash = off(ss.officestring('Latin', ctx.commemoratio, flag));
        const clear = () => {
          ctx.commemoratio = '';
          ctx.commemoratioHash = EMPTY;
          ctx.dayname[2] = '';
          ctx.commemoentries = [];
        };
        if (/1960/.test(version) && /Festum Domini/.test(S(ctx.winnerHash.get('Rule'))) && /Festum Domini/i.test(S(ctx.commemoratioHash.get('Rule')))) clear();
        if (/196/.test(version) && /06-28r?/i.test(ctx.commemoratio) && ctx.dayofweek === 0) clear();
        if (ctx.vespera === ctx.svesp && ctx.vespera === 1 && ctx.cvespera === 3 && /No second Vespera/i.test(S(ctx.commemoratioHash.get('Rule')))) clear();
      }

      if (/monastic/i.test(version) && /(?:Pasc|Pent)/.test(S(ctx.scriptura)) && month < 11 && !/Vigilia/.test(S(ctx.dayname[1])) && ctx.dayofweek > 0) ctx.scriptura = '';

      if (T(ctx.scriptura)) {
        ctx.scripturaHash = off(ss.officestring('Latin', ctx.scriptura));
        if (!T(ctx.dayname[2]) && !/Nat0[12345]/.test(ctx.scriptura)) {
          ctx.dayname[2] = `Scriptura: ${S(ctx.scripturaHash.get('Rank'))}  ${ctx.scriptura}`.replace(/;;.*/s, '');
        }
      }

      if (emberday()) ctx.transfervigil = '';

      if (T(ctx.commune)) {
        ctx.communeHash = off(ss.officestring('Latin', ctx.commune));
        if (/C10/.test(ctx.commune)) {
          ctx.rule += 'ex ' + ctx.C10;
          ctx.rule = ctx.rule.replace(/Oratio Dominica/gi, '');
          ctx.winnerHash.set('Rank', `Sanctæ Mariæ Sabbato;;Simplex;;1.3;;ex ${ctx.C10}`);
        }
        if (/\;\;ex\s/.test(S(ctx.winnerHash.get('Rank'))) || (/Trident/i.test(version) && /\;\;(ex|vide)/i.test(S(ctx.winnerHash.get('Rank'))) && ctx.duplex > 1)) {
          ctx.communerule = S(ctx.communeHash.get('Rule'));
        }
      }

      const vtv = ctx.votive !== 'Hodie' ? ctx.votive : '';
      if (vtv) throw new Error('votive offices are not implemented');

      if (/Trident/i.test(version)) {
        ctx.laudes = /Quad/i.test(S(ctx.dayname[0])) && ctx.dayofweek === 0 && /Tempora/i.test(S(ctx.winner)) ? 2 : '';
      } else {
        ctx.laudes =
          (((/Adv/i.test(S(ctx.dayname[0])) && ctx.dayofweek !== 0) || /Quad/i.test(S(ctx.dayname[0])) || (emberday() && !/Pasc/i.test(S(ctx.dayname[0])))) &&
            /tempora/i.test(S(ctx.winner)) &&
            !/(Beatæ|Sanctæ) Mariæ/i.test(S(ctx.winnerHash.get('Rank')))) ||
          /Laudes 2/i.test(ctx.rule) ||
          (/vigil/i.test(S(ctx.winnerHash.get('Rank'))) && !/19(?:55|60)/.test(version) && !/Psalmi Dominica/.test(ctx.rule))
            ? 2
            : 1;
      }
      return ctx;
    }

    // Office of the Dead recited after the hour? (Directorium.pm dirge())
    function dirge(hora) {
      if (!/Vespera|Laudes/i.test(hora)) return 0;
      const sday = /Laudes/i.test(hora) ? D.get_sday(ctx.month, ctx.day, ctx.year) : D.nextday(ctx.month, ctx.day, ctx.year);
      const line = [1, 2, 3].map((n) => S(get_from_directorium('transfer', ctx.version, 'dirge' + n, ctx.year))).join(' ');
      return new RegExp(sday).test(line) ? 1 : 0;
    }

    return { ctx, store, precedence, occurrence, concurrence, ss, directorium, emberday, extract_common, climit1960, dirge };
  }

  RB.createCalendar = createCalendar;
  if (typeof module !== 'undefined' && module.exports) module.exports = RB;
})(typeof globalThis !== 'undefined' ? globalThis : this);
