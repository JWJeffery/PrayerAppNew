/* How each diocese is named in running text on the parish pages ("The <name>'s page", "Parishes of the
 * <name> using the Universal Office"). Every diocese reads "Diocese of <label>" unless it is listed here.
 * To change how one diocese is named, add or edit a line in OVERRIDES: the key is the diocese key
 * (as in dioceses.js), the value is the full name, with no "The" in front. */
(function () {
  'use strict';
  var OVERRIDES = {
    'episcopal/western-oregon': 'Western Diocese of Oregon'
  };
  /** label: the short label from dioceses.js, such as "Western Oregon". */
  window.UO_dioceseName = function (key, label) {
    if (Object.prototype.hasOwnProperty.call(OVERRIDES, key)) { return OVERRIDES[key]; }
    return 'Diocese of ' + label;
  };
})();
