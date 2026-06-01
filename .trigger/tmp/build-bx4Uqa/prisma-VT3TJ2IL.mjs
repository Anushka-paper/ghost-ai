import {
  __commonJS,
  __name,
  __require,
  __toESM,
  init_esm
} from "./chunk-CEGEFIIW.mjs";

// node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "node_modules/postgres-array/index.js"(exports) {
    "use strict";
    init_esm();
    exports.parse = function(source, transform) {
      return new ArrayParser(source, transform).parse();
    };
    var ArrayParser = class _ArrayParser {
      static {
        __name(this, "ArrayParser");
      }
      constructor(source, transform) {
        this.source = source;
        this.transform = transform || identity;
        this.position = 0;
        this.entries = [];
        this.recorded = [];
        this.dimension = 0;
      }
      isEof() {
        return this.position >= this.source.length;
      }
      nextCharacter() {
        var character = this.source[this.position++];
        if (character === "\\") {
          return {
            value: this.source[this.position++],
            escaped: true
          };
        }
        return {
          value: character,
          escaped: false
        };
      }
      record(character) {
        this.recorded.push(character);
      }
      newEntry(includeEmpty) {
        var entry;
        if (this.recorded.length > 0 || includeEmpty) {
          entry = this.recorded.join("");
          if (entry === "NULL" && !includeEmpty) {
            entry = null;
          }
          if (entry !== null) entry = this.transform(entry);
          this.entries.push(entry);
          this.recorded = [];
        }
      }
      consumeDimensions() {
        if (this.source[0] === "[") {
          while (!this.isEof()) {
            var char = this.nextCharacter();
            if (char.value === "=") break;
          }
        }
      }
      parse(nested) {
        var character, parser, quote;
        this.consumeDimensions();
        while (!this.isEof()) {
          character = this.nextCharacter();
          if (character.value === "{" && !quote) {
            this.dimension++;
            if (this.dimension > 1) {
              parser = new _ArrayParser(this.source.substr(this.position - 1), this.transform);
              this.entries.push(parser.parse(true));
              this.position += parser.position - 2;
            }
          } else if (character.value === "}" && !quote) {
            this.dimension--;
            if (!this.dimension) {
              this.newEntry();
              if (nested) return this.entries;
            }
          } else if (character.value === '"' && !character.escaped) {
            if (quote) this.newEntry(true);
            quote = !quote;
          } else if (character.value === "," && !quote) {
            this.newEntry();
          } else {
            this.record(character.value);
          }
        }
        if (this.dimension !== 0) {
          throw new Error("array dimension not balanced");
        }
        return this.entries;
      }
    };
    function identity(value) {
      return value;
    }
    __name(identity, "identity");
  }
});

// node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS({
  "node_modules/pg-types/lib/arrayParser.js"(exports, module) {
    init_esm();
    var array = require_postgres_array();
    module.exports = {
      create: /* @__PURE__ */ __name(function(source, transform) {
        return {
          parse: /* @__PURE__ */ __name(function() {
            return array.parse(source, transform);
          }, "parse")
        };
      }, "create")
    };
  }
});

// node_modules/postgres-date/index.js
var require_postgres_date = __commonJS({
  "node_modules/postgres-date/index.js"(exports, module) {
    "use strict";
    init_esm();
    var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
    var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
    var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
    var INFINITY = /^-?infinity$/;
    module.exports = /* @__PURE__ */ __name(function parseDate(isoDate) {
      if (INFINITY.test(isoDate)) {
        return Number(isoDate.replace("i", "I"));
      }
      var matches = DATE_TIME.exec(isoDate);
      if (!matches) {
        return getDate(isoDate) || null;
      }
      var isBC = !!matches[8];
      var year = parseInt(matches[1], 10);
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var hour = parseInt(matches[4], 10);
      var minute = parseInt(matches[5], 10);
      var second = parseInt(matches[6], 10);
      var ms = matches[7];
      ms = ms ? 1e3 * parseFloat(ms) : 0;
      var date;
      var offset = timeZoneOffset(isoDate);
      if (offset != null) {
        date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
        if (is0To99(year)) {
          date.setUTCFullYear(year);
        }
        if (offset !== 0) {
          date.setTime(date.getTime() - offset);
        }
      } else {
        date = new Date(year, month, day, hour, minute, second, ms);
        if (is0To99(year)) {
          date.setFullYear(year);
        }
      }
      return date;
    }, "parseDate");
    function getDate(isoDate) {
      var matches = DATE.exec(isoDate);
      if (!matches) {
        return;
      }
      var year = parseInt(matches[1], 10);
      var isBC = !!matches[4];
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var date = new Date(year, month, day);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
      return date;
    }
    __name(getDate, "getDate");
    function timeZoneOffset(isoDate) {
      if (isoDate.endsWith("+00")) {
        return 0;
      }
      var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
      if (!zone) return;
      var type = zone[1];
      if (type === "Z") {
        return 0;
      }
      var sign = type === "-" ? -1 : 1;
      var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
      return offset * sign * 1e3;
    }
    __name(timeZoneOffset, "timeZoneOffset");
    function bcYearToNegativeYear(year) {
      return -(year - 1);
    }
    __name(bcYearToNegativeYear, "bcYearToNegativeYear");
    function is0To99(num) {
      return num >= 0 && num < 100;
    }
    __name(is0To99, "is0To99");
  }
});

// node_modules/xtend/mutable.js
var require_mutable = __commonJS({
  "node_modules/xtend/mutable.js"(exports, module) {
    init_esm();
    module.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
    __name(extend, "extend");
  }
});

// node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS({
  "node_modules/postgres-interval/index.js"(exports, module) {
    "use strict";
    init_esm();
    var extend = require_mutable();
    module.exports = PostgresInterval;
    function PostgresInterval(raw2) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw2);
      }
      extend(this, parse(raw2));
    }
    __name(PostgresInterval, "PostgresInterval");
    var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
    PostgresInterval.prototype.toPostgres = function() {
      var filtered = properties.filter(this.hasOwnProperty, this);
      if (this.milliseconds && filtered.indexOf("seconds") < 0) {
        filtered.push("seconds");
      }
      if (filtered.length === 0) return "0";
      return filtered.map(function(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/\.?0+$/, "");
        }
        return value + " " + property;
      }, this).join(" ");
    };
    var propertiesISOEquivalent = {
      years: "Y",
      months: "M",
      days: "D",
      hours: "H",
      minutes: "M",
      seconds: "S"
    };
    var dateProperties = ["years", "months", "days"];
    var timeProperties = ["hours", "minutes", "seconds"];
    PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
      var datePart = dateProperties.map(buildProperty, this).join("");
      var timePart = timeProperties.map(buildProperty, this).join("");
      return "P" + datePart + "T" + timePart;
      function buildProperty(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/0+$/, "");
        }
        return value + propertiesISOEquivalent[property];
      }
      __name(buildProperty, "buildProperty");
    };
    var NUMBER = "([+-]?\\d+)";
    var YEAR = NUMBER + "\\s+years?";
    var MONTH = NUMBER + "\\s+mons?";
    var DAY = NUMBER + "\\s+days?";
    var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
    var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
      return "(" + regexString + ")?";
    }).join("\\s*"));
    var positions = {
      years: 2,
      months: 4,
      days: 6,
      hours: 9,
      minutes: 10,
      seconds: 11,
      milliseconds: 12
    };
    var negatives = ["hours", "minutes", "seconds", "milliseconds"];
    function parseMilliseconds(fraction) {
      var microseconds = fraction + "000000".slice(fraction.length);
      return parseInt(microseconds, 10) / 1e3;
    }
    __name(parseMilliseconds, "parseMilliseconds");
    function parse(interval) {
      if (!interval) return {};
      var matches = INTERVAL.exec(interval);
      var isNegative = matches[8] === "-";
      return Object.keys(positions).reduce(function(parsed, property) {
        var position = positions[property];
        var value = matches[position];
        if (!value) return parsed;
        value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
        if (!value) return parsed;
        if (isNegative && ~negatives.indexOf(property)) {
          value *= -1;
        }
        parsed[property] = value;
        return parsed;
      }, {});
    }
    __name(parse, "parse");
  }
});

// node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS({
  "node_modules/postgres-bytea/index.js"(exports, module) {
    "use strict";
    init_esm();
    var bufferFrom = Buffer.from || Buffer;
    module.exports = /* @__PURE__ */ __name(function parseBytea(input) {
      if (/^\\x/.test(input)) {
        return bufferFrom(input.substr(2), "hex");
      }
      var output = "";
      var i = 0;
      while (i < input.length) {
        if (input[i] !== "\\") {
          output += input[i];
          ++i;
        } else {
          if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
            output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
            i += 4;
          } else {
            var backslashes = 1;
            while (i + backslashes < input.length && input[i + backslashes] === "\\") {
              backslashes++;
            }
            for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
              output += "\\";
            }
            i += Math.floor(backslashes / 2) * 2;
          }
        }
      }
      return bufferFrom(output, "binary");
    }, "parseBytea");
  }
});

// node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS({
  "node_modules/pg-types/lib/textParsers.js"(exports, module) {
    init_esm();
    var array = require_postgres_array();
    var arrayParser = require_arrayParser();
    var parseDate = require_postgres_date();
    var parseInterval = require_postgres_interval();
    var parseByteA = require_postgres_bytea();
    function allowNull(fn) {
      return /* @__PURE__ */ __name(function nullAllowed(value) {
        if (value === null) return value;
        return fn(value);
      }, "nullAllowed");
    }
    __name(allowNull, "allowNull");
    function parseBool(value) {
      if (value === null) return value;
      return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
    }
    __name(parseBool, "parseBool");
    function parseBoolArray(value) {
      if (!value) return null;
      return array.parse(value, parseBool);
    }
    __name(parseBoolArray, "parseBoolArray");
    function parseBaseTenInt(string) {
      return parseInt(string, 10);
    }
    __name(parseBaseTenInt, "parseBaseTenInt");
    function parseIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(parseBaseTenInt));
    }
    __name(parseIntegerArray, "parseIntegerArray");
    function parseBigIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(function(entry) {
        return parseBigInteger(entry).trim();
      }));
    }
    __name(parseBigIntegerArray, "parseBigIntegerArray");
    var parsePointArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parsePoint(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parsePointArray");
    var parseFloatArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseFloat(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseFloatArray");
    var parseStringArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value);
      return p.parse();
    }, "parseStringArray");
    var parseDateArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseDate(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseDateArray");
    var parseIntervalArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseInterval(entry);
        }
        return entry;
      });
      return p.parse();
    }, "parseIntervalArray");
    var parseByteAArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(parseByteA));
    }, "parseByteAArray");
    var parseInteger = /* @__PURE__ */ __name(function(value) {
      return parseInt(value, 10);
    }, "parseInteger");
    var parseBigInteger = /* @__PURE__ */ __name(function(value) {
      var valStr = String(value);
      if (/^\d+$/.test(valStr)) {
        return valStr;
      }
      return value;
    }, "parseBigInteger");
    var parseJsonArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(JSON.parse));
    }, "parseJsonArray");
    var parsePoint = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "(") {
        return null;
      }
      value = value.substring(1, value.length - 1).split(",");
      return {
        x: parseFloat(value[0]),
        y: parseFloat(value[1])
      };
    }, "parsePoint");
    var parseCircle = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "<" && value[1] !== "(") {
        return null;
      }
      var point = "(";
      var radius = "";
      var pointParsed = false;
      for (var i = 2; i < value.length - 1; i++) {
        if (!pointParsed) {
          point += value[i];
        }
        if (value[i] === ")") {
          pointParsed = true;
          continue;
        } else if (!pointParsed) {
          continue;
        }
        if (value[i] === ",") {
          continue;
        }
        radius += value[i];
      }
      var result = parsePoint(point);
      result.radius = parseFloat(radius);
      return result;
    }, "parseCircle");
    var init2 = /* @__PURE__ */ __name(function(register) {
      register(20, parseBigInteger);
      register(21, parseInteger);
      register(23, parseInteger);
      register(26, parseInteger);
      register(700, parseFloat);
      register(701, parseFloat);
      register(16, parseBool);
      register(1082, parseDate);
      register(1114, parseDate);
      register(1184, parseDate);
      register(600, parsePoint);
      register(651, parseStringArray);
      register(718, parseCircle);
      register(1e3, parseBoolArray);
      register(1001, parseByteAArray);
      register(1005, parseIntegerArray);
      register(1007, parseIntegerArray);
      register(1028, parseIntegerArray);
      register(1016, parseBigIntegerArray);
      register(1017, parsePointArray);
      register(1021, parseFloatArray);
      register(1022, parseFloatArray);
      register(1231, parseFloatArray);
      register(1014, parseStringArray);
      register(1015, parseStringArray);
      register(1008, parseStringArray);
      register(1009, parseStringArray);
      register(1040, parseStringArray);
      register(1041, parseStringArray);
      register(1115, parseDateArray);
      register(1182, parseDateArray);
      register(1185, parseDateArray);
      register(1186, parseInterval);
      register(1187, parseIntervalArray);
      register(17, parseByteA);
      register(114, JSON.parse.bind(JSON));
      register(3802, JSON.parse.bind(JSON));
      register(199, parseJsonArray);
      register(3807, parseJsonArray);
      register(3907, parseStringArray);
      register(2951, parseStringArray);
      register(791, parseStringArray);
      register(1183, parseStringArray);
      register(1270, parseStringArray);
    }, "init");
    module.exports = {
      init: init2
    };
  }
});

// node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS({
  "node_modules/pg-int8/index.js"(exports, module) {
    "use strict";
    init_esm();
    var BASE = 1e6;
    function readInt8(buffer) {
      var high = buffer.readInt32BE(0);
      var low = buffer.readUInt32BE(4);
      var sign = "";
      if (high < 0) {
        high = ~high + (low === 0);
        low = ~low + 1 >>> 0;
        sign = "-";
      }
      var result = "";
      var carry;
      var t;
      var digits;
      var pad;
      var l;
      var i;
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        t = 4294967296 * carry + low;
        digits = "" + t % BASE;
        return sign + digits + result;
      }
    }
    __name(readInt8, "readInt8");
    module.exports = readInt8;
  }
});

// node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS({
  "node_modules/pg-types/lib/binaryParsers.js"(exports, module) {
    init_esm();
    var parseInt64 = require_pg_int8();
    var parseBits = /* @__PURE__ */ __name(function(data, bits, offset, invert, callback) {
      offset = offset || 0;
      invert = invert || false;
      callback = callback || function(lastValue, newValue, bits2) {
        return lastValue * Math.pow(2, bits2) + newValue;
      };
      var offsetBytes = offset >> 3;
      var inv = /* @__PURE__ */ __name(function(value) {
        if (invert) {
          return ~value & 255;
        }
        return value;
      }, "inv");
      var mask = 255;
      var firstBits = 8 - offset % 8;
      if (bits < firstBits) {
        mask = 255 << 8 - bits & 255;
        firstBits = bits;
      }
      if (offset) {
        mask = mask >> offset % 8;
      }
      var result = 0;
      if (offset % 8 + bits >= 8) {
        result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
      }
      var bytes = bits + offset >> 3;
      for (var i = offsetBytes + 1; i < bytes; i++) {
        result = callback(result, inv(data[i]), 8);
      }
      var lastBits = (bits + offset) % 8;
      if (lastBits > 0) {
        result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
      }
      return result;
    }, "parseBits");
    var parseFloatFromBits = /* @__PURE__ */ __name(function(data, precisionBits, exponentBits) {
      var bias = Math.pow(2, exponentBits - 1) - 1;
      var sign = parseBits(data, 1);
      var exponent = parseBits(data, exponentBits, 1);
      if (exponent === 0) {
        return 0;
      }
      var precisionBitsCounter = 1;
      var parsePrecisionBits = /* @__PURE__ */ __name(function(lastValue, newValue, bits) {
        if (lastValue === 0) {
          lastValue = 1;
        }
        for (var i = 1; i <= bits; i++) {
          precisionBitsCounter /= 2;
          if ((newValue & 1 << bits - i) > 0) {
            lastValue += precisionBitsCounter;
          }
        }
        return lastValue;
      }, "parsePrecisionBits");
      var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
      if (exponent == Math.pow(2, exponentBits + 1) - 1) {
        if (mantissa === 0) {
          return sign === 0 ? Infinity : -Infinity;
        }
        return NaN;
      }
      return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
    }, "parseFloatFromBits");
    var parseInt16 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 15, 1, true) + 1);
      }
      return parseBits(value, 15, 1);
    }, "parseInt16");
    var parseInt32 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 31, 1, true) + 1);
      }
      return parseBits(value, 31, 1);
    }, "parseInt32");
    var parseFloat32 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 23, 8);
    }, "parseFloat32");
    var parseFloat64 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 52, 11);
    }, "parseFloat64");
    var parseNumeric = /* @__PURE__ */ __name(function(value) {
      var sign = parseBits(value, 16, 32);
      if (sign == 49152) {
        return NaN;
      }
      var weight = Math.pow(1e4, parseBits(value, 16, 16));
      var result = 0;
      var digits = [];
      var ndigits = parseBits(value, 16);
      for (var i = 0; i < ndigits; i++) {
        result += parseBits(value, 16, 64 + 16 * i) * weight;
        weight /= 1e4;
      }
      var scale = Math.pow(10, parseBits(value, 16, 48));
      return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
    }, "parseNumeric");
    var parseDate = /* @__PURE__ */ __name(function(isUTC, value) {
      var sign = parseBits(value, 1);
      var rawValue = parseBits(value, 63, 1);
      var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1e3 + 9466848e5);
      if (!isUTC) {
        result.setTime(result.getTime() + result.getTimezoneOffset() * 6e4);
      }
      result.usec = rawValue % 1e3;
      result.getMicroSeconds = function() {
        return this.usec;
      };
      result.setMicroSeconds = function(value2) {
        this.usec = value2;
      };
      result.getUTCMicroSeconds = function() {
        return this.usec;
      };
      return result;
    }, "parseDate");
    var parseArray2 = /* @__PURE__ */ __name(function(value) {
      var dim2 = parseBits(value, 32);
      var flags = parseBits(value, 32, 32);
      var elementType = parseBits(value, 32, 64);
      var offset = 96;
      var dims = [];
      for (var i = 0; i < dim2; i++) {
        dims[i] = parseBits(value, 32, offset);
        offset += 32;
        offset += 32;
      }
      var parseElement = /* @__PURE__ */ __name(function(elementType2) {
        var length = parseBits(value, 32, offset);
        offset += 32;
        if (length == 4294967295) {
          return null;
        }
        var result;
        if (elementType2 == 23 || elementType2 == 20) {
          result = parseBits(value, length * 8, offset);
          offset += length * 8;
          return result;
        } else if (elementType2 == 25) {
          result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
          return result;
        } else {
          console.log("ERROR: ElementType not implemented: " + elementType2);
        }
      }, "parseElement");
      var parse = /* @__PURE__ */ __name(function(dimension, elementType2) {
        var array = [];
        var i2;
        if (dimension.length > 1) {
          var count = dimension.shift();
          for (i2 = 0; i2 < count; i2++) {
            array[i2] = parse(dimension, elementType2);
          }
          dimension.unshift(count);
        } else {
          for (i2 = 0; i2 < dimension[0]; i2++) {
            array[i2] = parseElement(elementType2);
          }
        }
        return array;
      }, "parse");
      return parse(dims, elementType);
    }, "parseArray");
    var parseText = /* @__PURE__ */ __name(function(value) {
      return value.toString("utf8");
    }, "parseText");
    var parseBool = /* @__PURE__ */ __name(function(value) {
      if (value === null) return null;
      return parseBits(value, 8) > 0;
    }, "parseBool");
    var init2 = /* @__PURE__ */ __name(function(register) {
      register(20, parseInt64);
      register(21, parseInt16);
      register(23, parseInt32);
      register(26, parseInt32);
      register(1700, parseNumeric);
      register(700, parseFloat32);
      register(701, parseFloat64);
      register(16, parseBool);
      register(1114, parseDate.bind(null, false));
      register(1184, parseDate.bind(null, true));
      register(1e3, parseArray2);
      register(1007, parseArray2);
      register(1016, parseArray2);
      register(1008, parseArray2);
      register(1009, parseArray2);
      register(25, parseText);
    }, "init");
    module.exports = {
      init: init2
    };
  }
});

// node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS({
  "node_modules/pg-types/lib/builtins.js"(exports, module) {
    init_esm();
    module.exports = {
      BOOL: 16,
      BYTEA: 17,
      CHAR: 18,
      INT8: 20,
      INT2: 21,
      INT4: 23,
      REGPROC: 24,
      TEXT: 25,
      OID: 26,
      TID: 27,
      XID: 28,
      CID: 29,
      JSON: 114,
      XML: 142,
      PG_NODE_TREE: 194,
      SMGR: 210,
      PATH: 602,
      POLYGON: 604,
      CIDR: 650,
      FLOAT4: 700,
      FLOAT8: 701,
      ABSTIME: 702,
      RELTIME: 703,
      TINTERVAL: 704,
      CIRCLE: 718,
      MACADDR8: 774,
      MONEY: 790,
      MACADDR: 829,
      INET: 869,
      ACLITEM: 1033,
      BPCHAR: 1042,
      VARCHAR: 1043,
      DATE: 1082,
      TIME: 1083,
      TIMESTAMP: 1114,
      TIMESTAMPTZ: 1184,
      INTERVAL: 1186,
      TIMETZ: 1266,
      BIT: 1560,
      VARBIT: 1562,
      NUMERIC: 1700,
      REFCURSOR: 1790,
      REGPROCEDURE: 2202,
      REGOPER: 2203,
      REGOPERATOR: 2204,
      REGCLASS: 2205,
      REGTYPE: 2206,
      UUID: 2950,
      TXID_SNAPSHOT: 2970,
      PG_LSN: 3220,
      PG_NDISTINCT: 3361,
      PG_DEPENDENCIES: 3402,
      TSVECTOR: 3614,
      TSQUERY: 3615,
      GTSVECTOR: 3642,
      REGCONFIG: 3734,
      REGDICTIONARY: 3769,
      JSONB: 3802,
      REGNAMESPACE: 4089,
      REGROLE: 4096
    };
  }
});

// node_modules/pg-types/index.js
var require_pg_types = __commonJS({
  "node_modules/pg-types/index.js"(exports) {
    init_esm();
    var textParsers = require_textParsers();
    var binaryParsers = require_binaryParsers();
    var arrayParser = require_arrayParser();
    var builtinTypes = require_builtins();
    exports.getTypeParser = getTypeParser2;
    exports.setTypeParser = setTypeParser;
    exports.arrayParser = arrayParser;
    exports.builtins = builtinTypes;
    var typeParsers = {
      text: {},
      binary: {}
    };
    function noParse(val) {
      return String(val);
    }
    __name(noParse, "noParse");
    function getTypeParser2(oid, format) {
      format = format || "text";
      if (!typeParsers[format]) {
        return noParse;
      }
      return typeParsers[format][oid] || noParse;
    }
    __name(getTypeParser2, "getTypeParser");
    function setTypeParser(oid, format, parseFn) {
      if (typeof format == "function") {
        parseFn = format;
        format = "text";
      }
      typeParsers[format][oid] = parseFn;
    }
    __name(setTypeParser, "setTypeParser");
    textParsers.init(function(oid, converter) {
      typeParsers.text[oid] = converter;
    });
    binaryParsers.init(function(oid, converter) {
      typeParsers.binary[oid] = converter;
    });
  }
});

// node_modules/pg/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/pg/lib/defaults.js"(exports, module) {
    "use strict";
    init_esm();
    var user;
    try {
      user = process.platform === "win32" ? process.env.USERNAME : process.env.USER;
    } catch {
    }
    module.exports = {
      // database host. defaults to localhost
      host: "localhost",
      // database user's name
      user,
      // name of database to connect
      database: void 0,
      // database user's password
      password: null,
      // a Postgres connection string to be used instead of setting individual connection items
      // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
      // in the defaults object.
      connectionString: void 0,
      // database port
      port: 5432,
      // number of rows to return at a time from a prepared statement's
      // portal. 0 will return all rows at once
      rows: 0,
      // binary result mode
      binary: false,
      // Connection pool options - see https://github.com/brianc/node-pg-pool
      // number of connections to use in connection pool
      // 0 will disable connection pooling
      max: 10,
      // max milliseconds a client can go unused before it is removed
      // from the pool and destroyed
      idleTimeoutMillis: 3e4,
      client_encoding: "",
      ssl: false,
      application_name: void 0,
      fallback_application_name: void 0,
      options: void 0,
      parseInputDatesAsUTC: false,
      // max milliseconds any query using this connection will execute for before timing out in error.
      // false=unlimited
      statement_timeout: false,
      // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
      // false=unlimited
      lock_timeout: false,
      // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
      // false=unlimited
      idle_in_transaction_session_timeout: false,
      // max milliseconds to wait for query to complete (client side)
      query_timeout: false,
      connect_timeout: 0,
      keepalives: 1,
      keepalives_idle: 0
    };
    var pgTypes = require_pg_types();
    var parseBigInteger = pgTypes.getTypeParser(20, "text");
    var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
    module.exports.__defineSetter__("parseInt8", function(val) {
      pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
      pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
    });
  }
});

// node_modules/pg/lib/utils.js
var require_utils = __commonJS({
  "node_modules/pg/lib/utils.js"(exports, module) {
    "use strict";
    init_esm();
    var defaults2 = require_defaults();
    var util = __require("util");
    var { isDate } = util.types || util;
    function escapeElement(elementRepresentation) {
      const escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    __name(escapeElement, "escapeElement");
    function arrayString(val) {
      let result = "{";
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          result = result + ",";
        }
        if (val[i] === null || typeof val[i] === "undefined") {
          result = result + "NULL";
        } else if (Array.isArray(val[i])) {
          result = result + arrayString(val[i]);
        } else if (ArrayBuffer.isView(val[i])) {
          let item = val[i];
          if (!(item instanceof Buffer)) {
            const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
            if (buf.length === item.byteLength) {
              item = buf;
            } else {
              item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
            }
          }
          result += "\\\\x" + item.toString("hex");
        } else {
          result += escapeElement(prepareValue(val[i]));
        }
      }
      result = result + "}";
      return result;
    }
    __name(arrayString, "arrayString");
    var prepareValue = /* @__PURE__ */ __name(function(val, seen) {
      if (val == null) {
        return null;
      }
      if (typeof val === "object") {
        if (val instanceof Buffer) {
          return val;
        }
        if (ArrayBuffer.isView(val)) {
          const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
          if (buf.length === val.byteLength) {
            return buf;
          }
          return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
        }
        if (isDate(val)) {
          if (defaults2.parseInputDatesAsUTC) {
            return dateToStringUTC(val);
          } else {
            return dateToString(val);
          }
        }
        if (Array.isArray(val)) {
          return arrayString(val);
        }
        return prepareObject(val, seen);
      }
      return val.toString();
    }, "prepareValue");
    function prepareObject(val, seen) {
      if (val && typeof val.toPostgres === "function") {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error('circular reference detected while preparing "' + val + '" for query');
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    }
    __name(prepareObject, "prepareObject");
    function dateToString(date) {
      let offset = -date.getTimezoneOffset();
      let year = date.getFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0");
      if (offset < 0) {
        ret += "-";
        offset *= -1;
      } else {
        ret += "+";
      }
      ret += String(Math.floor(offset / 60)).padStart(2, "0") + ":" + String(offset % 60).padStart(2, "0");
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToString, "dateToString");
    function dateToStringUTC(date) {
      let year = date.getUTCFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + "T" + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0") + "." + String(date.getUTCMilliseconds()).padStart(3, "0");
      ret += "+00:00";
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToStringUTC, "dateToStringUTC");
    function normalizeQueryConfig(config, values, callback) {
      config = typeof config === "string" ? { text: config } : config;
      if (values) {
        if (typeof values === "function") {
          config.callback = values;
        } else {
          config.values = values;
        }
      }
      if (callback) {
        config.callback = callback;
      }
      return config;
    }
    __name(normalizeQueryConfig, "normalizeQueryConfig");
    var escapeIdentifier2 = /* @__PURE__ */ __name(function(str) {
      return '"' + str.replace(/"/g, '""') + '"';
    }, "escapeIdentifier");
    var escapeLiteral2 = /* @__PURE__ */ __name(function(str) {
      let hasBackslash = false;
      let escaped = "'";
      if (str == null) {
        return "''";
      }
      if (typeof str !== "string") {
        return "''";
      }
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") {
          escaped += c + c;
        } else if (c === "\\") {
          escaped += c + c;
          hasBackslash = true;
        } else {
          escaped += c;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = " E" + escaped;
      }
      return escaped;
    }, "escapeLiteral");
    module.exports = {
      prepareValue: /* @__PURE__ */ __name(function prepareValueWrapper(value) {
        return prepareValue(value);
      }, "prepareValueWrapper"),
      normalizeQueryConfig,
      escapeIdentifier: escapeIdentifier2,
      escapeLiteral: escapeLiteral2
    };
  }
});

// node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS({
  "node_modules/pg/lib/crypto/utils-legacy.js"(exports, module) {
    "use strict";
    init_esm();
    var nodeCrypto = __require("crypto");
    function md5(string) {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    }
    __name(md5, "md5");
    function postgresMd5PasswordHash(user, password, salt) {
      const inner = md5(password + user);
      const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    function sha256(text) {
      return nodeCrypto.createHash("sha256").update(text).digest();
    }
    __name(sha256, "sha256");
    function hashByName(hashName, text) {
      hashName = hashName.replace(/(\D)-/, "$1");
      return nodeCrypto.createHash(hashName).update(text).digest();
    }
    __name(hashByName, "hashByName");
    function hmacSha256(key, msg) {
      return nodeCrypto.createHmac("sha256", key).update(msg).digest();
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    }
    __name(deriveKey, "deriveKey");
    module.exports = {
      postgresMd5PasswordHash,
      randomBytes: nodeCrypto.randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
  }
});

// node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS({
  "node_modules/pg/lib/crypto/utils-webcrypto.js"(exports, module) {
    init_esm();
    var nodeCrypto = __require("crypto");
    module.exports = {
      postgresMd5PasswordHash,
      randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
    var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
    var subtleCrypto = webCrypto.subtle;
    var textEncoder = new TextEncoder();
    function randomBytes(length) {
      return webCrypto.getRandomValues(Buffer.alloc(length));
    }
    __name(randomBytes, "randomBytes");
    async function md5(string) {
      try {
        return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
      } catch (e) {
        const data = typeof string === "string" ? textEncoder.encode(string) : string;
        const hash = await subtleCrypto.digest("MD5", data);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
    __name(md5, "md5");
    async function postgresMd5PasswordHash(user, password, salt) {
      const inner = await md5(password + user);
      const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    async function sha256(text) {
      return await subtleCrypto.digest("SHA-256", text);
    }
    __name(sha256, "sha256");
    async function hashByName(hashName, text) {
      return await subtleCrypto.digest(hashName, text);
    }
    __name(hashByName, "hashByName");
    async function hmacSha256(keyBuffer, msg) {
      const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
      const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
      return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
    }
    __name(deriveKey, "deriveKey");
  }
});

// node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS({
  "node_modules/pg/lib/crypto/utils.js"(exports, module) {
    "use strict";
    init_esm();
    var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
    if (useLegacyCrypto) {
      module.exports = require_utils_legacy();
    } else {
      module.exports = require_utils_webcrypto();
    }
  }
});

// node_modules/pg/lib/crypto/cert-signatures.js
var require_cert_signatures = __commonJS({
  "node_modules/pg/lib/crypto/cert-signatures.js"(exports, module) {
    init_esm();
    function x509Error(msg, cert) {
      return new Error("SASL channel binding: " + msg + " when parsing public certificate " + cert.toString("base64"));
    }
    __name(x509Error, "x509Error");
    function readASN1Length(data, index) {
      let length = data[index++];
      if (length < 128) return { length, index };
      const lengthBytes = length & 127;
      if (lengthBytes > 4) throw x509Error("bad length", data);
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = length << 8 | data[index++];
      }
      return { length, index };
    }
    __name(readASN1Length, "readASN1Length");
    function readASN1OID(data, index) {
      if (data[index++] !== 6) throw x509Error("non-OID data", data);
      const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
      index = indexAfterOIDLength;
      const lastIndex = index + OIDLength;
      const byte1 = data[index++];
      let oid = (byte1 / 40 >> 0) + "." + byte1 % 40;
      while (index < lastIndex) {
        let value = 0;
        while (index < lastIndex) {
          const nextByte = data[index++];
          value = value << 7 | nextByte & 127;
          if (nextByte < 128) break;
        }
        oid += "." + value;
      }
      return { oid, index };
    }
    __name(readASN1OID, "readASN1OID");
    function expectASN1Seq(data, index) {
      if (data[index++] !== 48) throw x509Error("non-sequence data", data);
      return readASN1Length(data, index);
    }
    __name(expectASN1Seq, "expectASN1Seq");
    function signatureAlgorithmHashFromCertificate(data, index) {
      if (index === void 0) index = 0;
      index = expectASN1Seq(data, index).index;
      const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
      index = indexAfterCertInfoLength + certInfoLength;
      index = expectASN1Seq(data, index).index;
      const { oid, index: indexAfterOID } = readASN1OID(data, index);
      switch (oid) {
        // RSA
        case "1.2.840.113549.1.1.4":
          return "MD5";
        case "1.2.840.113549.1.1.5":
          return "SHA-1";
        case "1.2.840.113549.1.1.11":
          return "SHA-256";
        case "1.2.840.113549.1.1.12":
          return "SHA-384";
        case "1.2.840.113549.1.1.13":
          return "SHA-512";
        case "1.2.840.113549.1.1.14":
          return "SHA-224";
        case "1.2.840.113549.1.1.15":
          return "SHA512-224";
        case "1.2.840.113549.1.1.16":
          return "SHA512-256";
        // ECDSA
        case "1.2.840.10045.4.1":
          return "SHA-1";
        case "1.2.840.10045.4.3.1":
          return "SHA-224";
        case "1.2.840.10045.4.3.2":
          return "SHA-256";
        case "1.2.840.10045.4.3.3":
          return "SHA-384";
        case "1.2.840.10045.4.3.4":
          return "SHA-512";
        // RSASSA-PSS: hash is indicated separately
        case "1.2.840.113549.1.1.10": {
          index = indexAfterOID;
          index = expectASN1Seq(data, index).index;
          if (data[index++] !== 160) throw x509Error("non-tag data", data);
          index = readASN1Length(data, index).index;
          index = expectASN1Seq(data, index).index;
          const { oid: hashOID } = readASN1OID(data, index);
          switch (hashOID) {
            // standalone hash OIDs
            case "1.2.840.113549.2.5":
              return "MD5";
            case "1.3.14.3.2.26":
              return "SHA-1";
            case "2.16.840.1.101.3.4.2.1":
              return "SHA-256";
            case "2.16.840.1.101.3.4.2.2":
              return "SHA-384";
            case "2.16.840.1.101.3.4.2.3":
              return "SHA-512";
          }
          throw x509Error("unknown hash OID " + hashOID, data);
        }
        // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
        case "1.3.101.110":
        case "1.3.101.112":
          return "SHA-512";
        // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
        case "1.3.101.111":
        case "1.3.101.113":
          throw x509Error("Ed448 certificate channel binding is not currently supported by Postgres");
      }
      throw x509Error("unknown OID " + oid, data);
    }
    __name(signatureAlgorithmHashFromCertificate, "signatureAlgorithmHashFromCertificate");
    module.exports = { signatureAlgorithmHashFromCertificate };
  }
});

// node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS({
  "node_modules/pg/lib/crypto/sasl.js"(exports, module) {
    "use strict";
    init_esm();
    var crypto2 = require_utils2();
    var { signatureAlgorithmHashFromCertificate } = require_cert_signatures();
    function startSession(mechanisms, stream) {
      const candidates = ["SCRAM-SHA-256"];
      if (stream) candidates.unshift("SCRAM-SHA-256-PLUS");
      const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));
      if (!mechanism) {
        throw new Error("SASL: Only mechanism(s) " + candidates.join(" and ") + " are supported");
      }
      if (mechanism === "SCRAM-SHA-256-PLUS" && typeof stream.getPeerCertificate !== "function") {
        throw new Error("SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate");
      }
      const clientNonce = crypto2.randomBytes(18).toString("base64");
      const gs2Header = mechanism === "SCRAM-SHA-256-PLUS" ? "p=tls-server-end-point" : stream ? "y" : "n";
      return {
        mechanism,
        clientNonce,
        response: gs2Header + ",,n=*,r=" + clientNonce,
        message: "SASLInitialResponse"
      };
    }
    __name(startSession, "startSession");
    async function continueSession(session, password, serverData, stream) {
      if (session.message !== "SASLInitialResponse") {
        throw new Error("SASL: Last message was not SASLInitialResponse");
      }
      if (typeof password !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
      }
      if (password === "") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
      }
      const sv = parseServerFirstMessage(serverData);
      if (!sv.nonce.startsWith(session.clientNonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
      } else if (sv.nonce.length === session.clientNonce.length) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
      }
      const clientFirstMessageBare = "n=*,r=" + session.clientNonce;
      const serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
      let channelBinding = stream ? "eSws" : "biws";
      if (session.mechanism === "SCRAM-SHA-256-PLUS") {
        const peerCert = stream.getPeerCertificate().raw;
        let hashName = signatureAlgorithmHashFromCertificate(peerCert);
        if (hashName === "MD5" || hashName === "SHA-1") hashName = "SHA-256";
        const certHash = await crypto2.hashByName(hashName, peerCert);
        const bindingData = Buffer.concat([Buffer.from("p=tls-server-end-point,,"), Buffer.from(certHash)]);
        channelBinding = bindingData.toString("base64");
      }
      const clientFinalMessageWithoutProof = "c=" + channelBinding + ",r=" + sv.nonce;
      const authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
      const saltBytes = Buffer.from(sv.salt, "base64");
      const saltedPassword = await crypto2.deriveKey(password, saltBytes, sv.iteration);
      const clientKey = await crypto2.hmacSha256(saltedPassword, "Client Key");
      const storedKey = await crypto2.sha256(clientKey);
      const clientSignature = await crypto2.hmacSha256(storedKey, authMessage);
      const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
      const serverKey = await crypto2.hmacSha256(saltedPassword, "Server Key");
      const serverSignatureBytes = await crypto2.hmacSha256(serverKey, authMessage);
      session.message = "SASLResponse";
      session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
      session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
    }
    __name(continueSession, "continueSession");
    function finalizeSession(session, serverData) {
      if (session.message !== "SASLResponse") {
        throw new Error("SASL: Last message was not SASLResponse");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
      }
      const { serverSignature } = parseServerFinalMessage(serverData);
      if (serverSignature !== session.serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
    }
    __name(finalizeSession, "finalizeSession");
    function isPrintableChars(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: text must be a string");
      }
      return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
    }
    __name(isPrintableChars, "isPrintableChars");
    function isBase64(text) {
      return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
    }
    __name(isBase64, "isBase64");
    function parseAttributePairs(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: attribute pairs text must be a string");
      }
      return new Map(
        text.split(",").map((attrValue) => {
          if (!/^.=/.test(attrValue)) {
            throw new Error("SASL: Invalid attribute pair entry");
          }
          const name2 = attrValue[0];
          const value = attrValue.substring(2);
          return [name2, value];
        })
      );
    }
    __name(parseAttributePairs, "parseAttributePairs");
    function parseServerFirstMessage(data) {
      const attrPairs = parseAttributePairs(data);
      const nonce = attrPairs.get("r");
      if (!nonce) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
      } else if (!isPrintableChars(nonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
      }
      const salt = attrPairs.get("s");
      if (!salt) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
      } else if (!isBase64(salt)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
      }
      const iterationText = attrPairs.get("i");
      if (!iterationText) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
      } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
      }
      const iteration = parseInt(iterationText, 10);
      return {
        nonce,
        salt,
        iteration
      };
    }
    __name(parseServerFirstMessage, "parseServerFirstMessage");
    function parseServerFinalMessage(serverData) {
      const attrPairs = parseAttributePairs(serverData);
      const serverSignature = attrPairs.get("v");
      if (!serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
      } else if (!isBase64(serverSignature)) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
      }
      return {
        serverSignature
      };
    }
    __name(parseServerFinalMessage, "parseServerFinalMessage");
    function xorBuffers(a, b) {
      if (!Buffer.isBuffer(a)) {
        throw new TypeError("first argument must be a Buffer");
      }
      if (!Buffer.isBuffer(b)) {
        throw new TypeError("second argument must be a Buffer");
      }
      if (a.length !== b.length) {
        throw new Error("Buffer lengths must match");
      }
      if (a.length === 0) {
        throw new Error("Buffers cannot be empty");
      }
      return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
    }
    __name(xorBuffers, "xorBuffers");
    module.exports = {
      startSession,
      continueSession,
      finalizeSession
    };
  }
});

// node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS({
  "node_modules/pg/lib/type-overrides.js"(exports, module) {
    "use strict";
    init_esm();
    var types3 = require_pg_types();
    function TypeOverrides2(userTypes) {
      this._types = userTypes || types3;
      this.text = {};
      this.binary = {};
    }
    __name(TypeOverrides2, "TypeOverrides");
    TypeOverrides2.prototype.getOverrides = function(format) {
      switch (format) {
        case "text":
          return this.text;
        case "binary":
          return this.binary;
        default:
          return {};
      }
    };
    TypeOverrides2.prototype.setTypeParser = function(oid, format, parseFn) {
      if (typeof format === "function") {
        parseFn = format;
        format = "text";
      }
      this.getOverrides(format)[oid] = parseFn;
    };
    TypeOverrides2.prototype.getTypeParser = function(oid, format) {
      format = format || "text";
      return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
    };
    module.exports = TypeOverrides2;
  }
});

// node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS({
  "node_modules/pg-connection-string/index.js"(exports, module) {
    "use strict";
    init_esm();
    function parse(str, options = {}) {
      if (str.charAt(0) === "/") {
        const config2 = str.split(" ");
        return { host: config2[0], database: config2[1] };
      }
      const config = {};
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
        str = encodeURI(str).replace(/%25(\d\d)/g, "%$1");
      }
      try {
        try {
          result = new URL(str, "postgres://base");
        } catch (e) {
          result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
          dummyHost = true;
        }
      } catch (err) {
        err.input && (err.input = "*****REDACTED*****");
        throw err;
      }
      for (const entry of result.searchParams.entries()) {
        config[entry[0]] = entry[1];
      }
      config.user = config.user || decodeURIComponent(result.username);
      config.password = config.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config.host = decodeURI(result.pathname);
        config.database = result.searchParams.get("db");
        config.client_encoding = result.searchParams.get("encoding");
        return config;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config.host) {
        config.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config.port) {
        config.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config.database = pathname ? decodeURI(pathname) : null;
      if (config.ssl === "true" || config.ssl === "1") {
        config.ssl = true;
      }
      if (config.ssl === "0") {
        config.ssl = false;
      }
      if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
        config.ssl = {};
      }
      const fs = config.sslcert || config.sslkey || config.sslrootcert ? __require("fs") : null;
      if (config.sslcert) {
        config.ssl.cert = fs.readFileSync(config.sslcert).toString();
      }
      if (config.sslkey) {
        config.ssl.key = fs.readFileSync(config.sslkey).toString();
      }
      if (config.sslrootcert) {
        config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config.sslrootcert) {
              config.ssl.checkServerIdentity = function() {
              };
            } else {
              config.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config.ssl.ca) {
              throw new Error(
                "SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security."
              );
            }
            config.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            if (config.sslmode !== "verify-full") {
              deprecatedSslModeWarning(config.sslmode);
            }
            break;
          }
          case "no-verify": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config;
    }
    __name(parse, "parse");
    function toConnectionOptions(sslConfig) {
      const connectionOptions = Object.entries(sslConfig).reduce((c, [key, value]) => {
        if (value !== void 0 && value !== null) {
          c[key] = value;
        }
        return c;
      }, {});
      return connectionOptions;
    }
    __name(toConnectionOptions, "toConnectionOptions");
    function toClientConfig(config) {
      const poolConfig = Object.entries(config).reduce((c, [key, value]) => {
        if (key === "ssl") {
          const sslConfig = value;
          if (typeof sslConfig === "boolean") {
            c[key] = sslConfig;
          }
          if (typeof sslConfig === "object") {
            c[key] = toConnectionOptions(sslConfig);
          }
        } else if (value !== void 0 && value !== null) {
          if (key === "port") {
            if (value !== "") {
              const v = parseInt(value, 10);
              if (isNaN(v)) {
                throw new Error(`Invalid ${key}: ${value}`);
              }
              c[key] = v;
            }
          } else {
            c[key] = value;
          }
        }
        return c;
      }, {});
      return poolConfig;
    }
    __name(toClientConfig, "toClientConfig");
    function parseIntoClientConfig(str) {
      return toClientConfig(parse(str));
    }
    __name(parseIntoClientConfig, "parseIntoClientConfig");
    function deprecatedSslModeWarning(sslmode) {
      if (!deprecatedSslModeWarning.warned && typeof process !== "undefined" && process.emitWarning) {
        deprecatedSslModeWarning.warned = true;
        process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${sslmode}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`);
      }
    }
    __name(deprecatedSslModeWarning, "deprecatedSslModeWarning");
    module.exports = parse;
    parse.parse = parse;
    parse.toClientConfig = toClientConfig;
    parse.parseIntoClientConfig = parseIntoClientConfig;
  }
});

// node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS({
  "node_modules/pg/lib/connection-parameters.js"(exports, module) {
    "use strict";
    init_esm();
    var dns = __require("dns");
    var defaults2 = require_defaults();
    var parse = require_pg_connection_string().parse;
    var val = /* @__PURE__ */ __name(function(key, config, envVar) {
      if (config[key]) {
        return config[key];
      }
      if (envVar === void 0) {
        envVar = process.env["PG" + key.toUpperCase()];
      } else if (envVar === false) {
      } else {
        envVar = process.env[envVar];
      }
      return envVar || defaults2[key];
    }, "val");
    var readSSLConfigFromEnvironment = /* @__PURE__ */ __name(function() {
      switch (process.env.PGSSLMODE) {
        case "disable":
          return false;
        case "prefer":
        case "require":
        case "verify-ca":
        case "verify-full":
          return true;
        case "no-verify":
          return { rejectUnauthorized: false };
      }
      return defaults2.ssl;
    }, "readSSLConfigFromEnvironment");
    var quoteParamValue = /* @__PURE__ */ __name(function(value) {
      return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    }, "quoteParamValue");
    var add = /* @__PURE__ */ __name(function(params, config, paramName) {
      const value = config[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    }, "add");
    var ConnectionParameters = class {
      static {
        __name(this, "ConnectionParameters");
      }
      constructor(config) {
        config = typeof config === "string" ? parse(config) : config || {};
        if (config.connectionString) {
          config = Object.assign({}, config, parse(config.connectionString));
        }
        this.user = val("user", config);
        this.database = val("database", config);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config), 10);
        this.host = val("host", config);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config)
        });
        this.binary = val("binary", config);
        this.options = val("options", config);
        this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
        if (typeof this.ssl === "string") {
          if (this.ssl === "true") {
            this.ssl = true;
          }
        }
        if (this.ssl === "no-verify") {
          this.ssl = { rejectUnauthorized: false };
        }
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this.client_encoding = val("client_encoding", config);
        this.replication = val("replication", config);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config, false);
        this.statement_timeout = val("statement_timeout", config, false);
        this.lock_timeout = val("lock_timeout", config, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
        this.query_timeout = val("query_timeout", config, false);
        if (config.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1e3);
        }
        if (config.keepAlive === false) {
          this.keepalives = 0;
        } else if (config.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1e3);
        }
      }
      getLibpqConnectionString(cb) {
        const params = [];
        add(params, this, "user");
        add(params, this, "password");
        add(params, this, "port");
        add(params, this, "application_name");
        add(params, this, "fallback_application_name");
        add(params, this, "connect_timeout");
        add(params, this, "options");
        const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
        add(params, ssl, "sslmode");
        add(params, ssl, "sslca");
        add(params, ssl, "sslkey");
        add(params, ssl, "sslcert");
        add(params, ssl, "sslrootcert");
        if (this.database) {
          params.push("dbname=" + quoteParamValue(this.database));
        }
        if (this.replication) {
          params.push("replication=" + quoteParamValue(this.replication));
        }
        if (this.host) {
          params.push("host=" + quoteParamValue(this.host));
        }
        if (this.isDomainSocket) {
          return cb(null, params.join(" "));
        }
        if (this.client_encoding) {
          params.push("client_encoding=" + quoteParamValue(this.client_encoding));
        }
        dns.lookup(this.host, function(err, address) {
          if (err) return cb(err, null);
          params.push("hostaddr=" + quoteParamValue(address));
          return cb(null, params.join(" "));
        });
      }
    };
    module.exports = ConnectionParameters;
  }
});

// node_modules/pg/lib/result.js
var require_result = __commonJS({
  "node_modules/pg/lib/result.js"(exports, module) {
    "use strict";
    init_esm();
    var types3 = require_pg_types();
    var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;
    var Result2 = class {
      static {
        __name(this, "Result");
      }
      constructor(rowMode, types4) {
        this.command = null;
        this.rowCount = null;
        this.oid = null;
        this.rows = [];
        this.fields = [];
        this._parsers = void 0;
        this._types = types4;
        this.RowCtor = null;
        this.rowAsArray = rowMode === "array";
        if (this.rowAsArray) {
          this.parseRow = this._parseRowAsArray;
        }
        this._prebuiltEmptyResultObject = null;
      }
      // adds a command complete message
      addCommandComplete(msg) {
        let match;
        if (msg.text) {
          match = matchRegexp.exec(msg.text);
        } else {
          match = matchRegexp.exec(msg.command);
        }
        if (match) {
          this.command = match[1];
          if (match[3]) {
            this.oid = parseInt(match[2], 10);
            this.rowCount = parseInt(match[3], 10);
          } else if (match[2]) {
            this.rowCount = parseInt(match[2], 10);
          }
        }
      }
      _parseRowAsArray(rowData) {
        const row = new Array(rowData.length);
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          if (rawValue !== null) {
            row[i] = this._parsers[i](rawValue);
          } else {
            row[i] = null;
          }
        }
        return row;
      }
      parseRow(rowData) {
        const row = { ...this._prebuiltEmptyResultObject };
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          const field = this.fields[i].name;
          if (rawValue !== null) {
            const v = this.fields[i].format === "binary" ? Buffer.from(rawValue) : rawValue;
            row[field] = this._parsers[i](v);
          } else {
            row[field] = null;
          }
        }
        return row;
      }
      addRow(row) {
        this.rows.push(row);
      }
      addFields(fieldDescriptions) {
        this.fields = fieldDescriptions;
        if (this.fields.length) {
          this._parsers = new Array(fieldDescriptions.length);
        }
        const row = {};
        for (let i = 0; i < fieldDescriptions.length; i++) {
          const desc = fieldDescriptions[i];
          row[desc.name] = null;
          if (this._types) {
            this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
          } else {
            this._parsers[i] = types3.getTypeParser(desc.dataTypeID, desc.format || "text");
          }
        }
        this._prebuiltEmptyResultObject = { ...row };
      }
    };
    module.exports = Result2;
  }
});

// node_modules/pg/lib/query.js
var require_query = __commonJS({
  "node_modules/pg/lib/query.js"(exports, module) {
    "use strict";
    init_esm();
    var { EventEmitter } = __require("events");
    var Result2 = require_result();
    var utils = require_utils();
    var Query2 = class extends EventEmitter {
      static {
        __name(this, "Query");
      }
      constructor(config, values, callback) {
        super();
        config = utils.normalizeQueryConfig(config, values, callback);
        this.text = config.text;
        this.values = config.values;
        this.rows = config.rows;
        this.types = config.types;
        this.name = config.name;
        this.queryMode = config.queryMode;
        this.binary = config.binary;
        this.portal = config.portal || "";
        this.callback = config.callback;
        this._rowMode = config.rowMode;
        if (process.domain && config.callback) {
          this.callback = process.domain.bind(config.callback);
        }
        this._result = new Result2(this._rowMode, this.types);
        this._results = this._result;
        this._canceledDueToError = false;
      }
      requiresPreparation() {
        if (this.queryMode === "extended") {
          return true;
        }
        if (this.name) {
          return true;
        }
        if (this.rows) {
          return true;
        }
        if (!this.text) {
          return false;
        }
        if (!this.values) {
          return false;
        }
        return this.values.length > 0;
      }
      _checkForMultirow() {
        if (this._result.command) {
          if (!Array.isArray(this._results)) {
            this._results = [this._result];
          }
          this._result = new Result2(this._rowMode, this._result._types);
          this._results.push(this._result);
        }
      }
      // associates row metadata from the supplied
      // message with this query object
      // metadata used when parsing row results
      handleRowDescription(msg) {
        this._checkForMultirow();
        this._result.addFields(msg.fields);
        this._accumulateRows = this.callback || !this.listeners("row").length;
      }
      handleDataRow(msg) {
        let row;
        if (this._canceledDueToError) {
          return;
        }
        try {
          row = this._result.parseRow(msg.fields);
        } catch (err) {
          this._canceledDueToError = err;
          return;
        }
        this.emit("row", row, this._result);
        if (this._accumulateRows) {
          this._result.addRow(row);
        }
      }
      handleCommandComplete(msg, connection) {
        this._checkForMultirow();
        this._result.addCommandComplete(msg);
        if (this.rows) {
          connection.sync();
        }
      }
      // if a named prepared statement is created with empty query text
      // the backend will send an emptyQuery message but *not* a command complete message
      // since we pipeline sync immediately after execute we don't need to do anything here
      // unless we have rows specified, in which case we did not pipeline the initial sync call
      handleEmptyQuery(connection) {
        if (this.rows) {
          connection.sync();
        }
      }
      handleError(err, connection) {
        if (this._canceledDueToError) {
          err = this._canceledDueToError;
          this._canceledDueToError = false;
        }
        if (this.callback) {
          return this.callback(err);
        }
        this.emit("error", err);
      }
      handleReadyForQuery(con) {
        if (this._canceledDueToError) {
          return this.handleError(this._canceledDueToError, con);
        }
        if (this.callback) {
          try {
            this.callback(null, this._results);
          } catch (err) {
            process.nextTick(() => {
              throw err;
            });
          }
        }
        this.emit("end", this._results);
      }
      submit(connection) {
        if (typeof this.text !== "string" && typeof this.name !== "string") {
          return new Error("A query must have either text or a name. Supplying neither is unsupported.");
        }
        const previous = connection.parsedStatements[this.name];
        if (this.text && previous && this.text !== previous) {
          return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
        }
        if (this.values && !Array.isArray(this.values)) {
          return new Error("Query values must be an array");
        }
        if (this.requiresPreparation()) {
          connection.stream.cork && connection.stream.cork();
          try {
            this.prepare(connection);
          } finally {
            connection.stream.uncork && connection.stream.uncork();
          }
        } else {
          connection.query(this.text);
        }
        return null;
      }
      hasBeenParsed(connection) {
        return this.name && connection.parsedStatements[this.name];
      }
      handlePortalSuspended(connection) {
        this._getRows(connection, this.rows);
      }
      _getRows(connection, rows) {
        connection.execute({
          portal: this.portal,
          rows
        });
        if (!rows) {
          connection.sync();
        } else {
          connection.flush();
        }
      }
      // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
      prepare(connection) {
        if (!this.hasBeenParsed(connection)) {
          connection.parse({
            text: this.text,
            name: this.name,
            types: this.types
          });
        }
        try {
          connection.bind({
            portal: this.portal,
            statement: this.name,
            values: this.values,
            binary: this.binary,
            valueMapper: utils.prepareValue
          });
        } catch (err) {
          this.handleError(err, connection);
          return;
        }
        connection.describe({
          type: "P",
          name: this.portal || ""
        });
        this._getRows(connection, this.rows);
      }
      handleCopyInResponse(connection) {
        connection.sendCopyFail("No source stream defined");
      }
      handleCopyData(msg, connection) {
      }
    };
    module.exports = Query2;
  }
});

// node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS({
  "node_modules/pg-protocol/dist/messages.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoticeMessage = exports.DataRowMessage = exports.CommandCompleteMessage = exports.ReadyForQueryMessage = exports.NotificationResponseMessage = exports.BackendKeyDataMessage = exports.AuthenticationMD5Password = exports.ParameterStatusMessage = exports.ParameterDescriptionMessage = exports.RowDescriptionMessage = exports.Field = exports.CopyResponse = exports.CopyDataMessage = exports.DatabaseError = exports.copyDone = exports.emptyQuery = exports.replicationStart = exports.portalSuspended = exports.noData = exports.closeComplete = exports.bindComplete = exports.parseComplete = void 0;
    exports.parseComplete = {
      name: "parseComplete",
      length: 5
    };
    exports.bindComplete = {
      name: "bindComplete",
      length: 5
    };
    exports.closeComplete = {
      name: "closeComplete",
      length: 5
    };
    exports.noData = {
      name: "noData",
      length: 5
    };
    exports.portalSuspended = {
      name: "portalSuspended",
      length: 5
    };
    exports.replicationStart = {
      name: "replicationStart",
      length: 4
    };
    exports.emptyQuery = {
      name: "emptyQuery",
      length: 4
    };
    exports.copyDone = {
      name: "copyDone",
      length: 4
    };
    var DatabaseError2 = class extends Error {
      static {
        __name(this, "DatabaseError");
      }
      constructor(message, length, name2) {
        super(message);
        this.length = length;
        this.name = name2;
      }
    };
    exports.DatabaseError = DatabaseError2;
    var CopyDataMessage = class {
      static {
        __name(this, "CopyDataMessage");
      }
      constructor(length, chunk) {
        this.length = length;
        this.chunk = chunk;
        this.name = "copyData";
      }
    };
    exports.CopyDataMessage = CopyDataMessage;
    var CopyResponse = class {
      static {
        __name(this, "CopyResponse");
      }
      constructor(length, name2, binary, columnCount) {
        this.length = length;
        this.name = name2;
        this.binary = binary;
        this.columnTypes = new Array(columnCount);
      }
    };
    exports.CopyResponse = CopyResponse;
    var Field = class {
      static {
        __name(this, "Field");
      }
      constructor(name2, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
        this.name = name2;
        this.tableID = tableID;
        this.columnID = columnID;
        this.dataTypeID = dataTypeID;
        this.dataTypeSize = dataTypeSize;
        this.dataTypeModifier = dataTypeModifier;
        this.format = format;
      }
    };
    exports.Field = Field;
    var RowDescriptionMessage = class {
      static {
        __name(this, "RowDescriptionMessage");
      }
      constructor(length, fieldCount) {
        this.length = length;
        this.fieldCount = fieldCount;
        this.name = "rowDescription";
        this.fields = new Array(this.fieldCount);
      }
    };
    exports.RowDescriptionMessage = RowDescriptionMessage;
    var ParameterDescriptionMessage = class {
      static {
        __name(this, "ParameterDescriptionMessage");
      }
      constructor(length, parameterCount) {
        this.length = length;
        this.parameterCount = parameterCount;
        this.name = "parameterDescription";
        this.dataTypeIDs = new Array(this.parameterCount);
      }
    };
    exports.ParameterDescriptionMessage = ParameterDescriptionMessage;
    var ParameterStatusMessage = class {
      static {
        __name(this, "ParameterStatusMessage");
      }
      constructor(length, parameterName, parameterValue) {
        this.length = length;
        this.parameterName = parameterName;
        this.parameterValue = parameterValue;
        this.name = "parameterStatus";
      }
    };
    exports.ParameterStatusMessage = ParameterStatusMessage;
    var AuthenticationMD5Password = class {
      static {
        __name(this, "AuthenticationMD5Password");
      }
      constructor(length, salt) {
        this.length = length;
        this.salt = salt;
        this.name = "authenticationMD5Password";
      }
    };
    exports.AuthenticationMD5Password = AuthenticationMD5Password;
    var BackendKeyDataMessage = class {
      static {
        __name(this, "BackendKeyDataMessage");
      }
      constructor(length, processID, secretKey) {
        this.length = length;
        this.processID = processID;
        this.secretKey = secretKey;
        this.name = "backendKeyData";
      }
    };
    exports.BackendKeyDataMessage = BackendKeyDataMessage;
    var NotificationResponseMessage = class {
      static {
        __name(this, "NotificationResponseMessage");
      }
      constructor(length, processId, channel, payload) {
        this.length = length;
        this.processId = processId;
        this.channel = channel;
        this.payload = payload;
        this.name = "notification";
      }
    };
    exports.NotificationResponseMessage = NotificationResponseMessage;
    var ReadyForQueryMessage = class {
      static {
        __name(this, "ReadyForQueryMessage");
      }
      constructor(length, status) {
        this.length = length;
        this.status = status;
        this.name = "readyForQuery";
      }
    };
    exports.ReadyForQueryMessage = ReadyForQueryMessage;
    var CommandCompleteMessage = class {
      static {
        __name(this, "CommandCompleteMessage");
      }
      constructor(length, text) {
        this.length = length;
        this.text = text;
        this.name = "commandComplete";
      }
    };
    exports.CommandCompleteMessage = CommandCompleteMessage;
    var DataRowMessage = class {
      static {
        __name(this, "DataRowMessage");
      }
      constructor(length, fields) {
        this.length = length;
        this.fields = fields;
        this.name = "dataRow";
        this.fieldCount = fields.length;
      }
    };
    exports.DataRowMessage = DataRowMessage;
    var NoticeMessage = class {
      static {
        __name(this, "NoticeMessage");
      }
      constructor(length, message) {
        this.length = length;
        this.message = message;
        this.name = "notice";
      }
    };
    exports.NoticeMessage = NoticeMessage;
  }
});

// node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS({
  "node_modules/pg-protocol/dist/buffer-writer.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Writer = void 0;
    var Writer = class {
      static {
        __name(this, "Writer");
      }
      constructor(size = 256) {
        this.size = size;
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(size);
      }
      ensure(size) {
        const remaining = this.buffer.length - this.offset;
        if (remaining < size) {
          const oldBuffer = this.buffer;
          const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
          this.buffer = Buffer.allocUnsafe(newSize);
          oldBuffer.copy(this.buffer);
        }
      }
      addInt32(num) {
        this.ensure(4);
        this.buffer[this.offset++] = num >>> 24 & 255;
        this.buffer[this.offset++] = num >>> 16 & 255;
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addInt16(num) {
        this.ensure(2);
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addCString(string) {
        if (!string) {
          this.ensure(1);
        } else {
          const len = Buffer.byteLength(string);
          this.ensure(len + 1);
          this.buffer.write(string, this.offset, "utf-8");
          this.offset += len;
        }
        this.buffer[this.offset++] = 0;
        return this;
      }
      addString(string = "") {
        const len = Buffer.byteLength(string);
        this.ensure(len);
        this.buffer.write(string, this.offset);
        this.offset += len;
        return this;
      }
      add(otherBuffer) {
        this.ensure(otherBuffer.length);
        otherBuffer.copy(this.buffer, this.offset);
        this.offset += otherBuffer.length;
        return this;
      }
      join(code) {
        if (code) {
          this.buffer[this.headerPosition] = code;
          const length = this.offset - (this.headerPosition + 1);
          this.buffer.writeInt32BE(length, this.headerPosition + 1);
        }
        return this.buffer.slice(code ? 0 : 5, this.offset);
      }
      flush(code) {
        const result = this.join(code);
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(this.size);
        return result;
      }
    };
    exports.Writer = Writer;
  }
});

// node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS({
  "node_modules/pg-protocol/dist/serializer.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialize = void 0;
    var buffer_writer_1 = require_buffer_writer();
    var writer = new buffer_writer_1.Writer();
    var startup = /* @__PURE__ */ __name((opts) => {
      writer.addInt16(3).addInt16(0);
      for (const key of Object.keys(opts)) {
        writer.addCString(key).addCString(opts[key]);
      }
      writer.addCString("client_encoding").addCString("UTF8");
      const bodyBuffer = writer.addCString("").flush();
      const length = bodyBuffer.length + 4;
      return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
    }, "startup");
    var requestSsl = /* @__PURE__ */ __name(() => {
      const response = Buffer.allocUnsafe(8);
      response.writeInt32BE(8, 0);
      response.writeInt32BE(80877103, 4);
      return response;
    }, "requestSsl");
    var password = /* @__PURE__ */ __name((password2) => {
      return writer.addCString(password2).flush(
        112
        /* code.startup */
      );
    }, "password");
    var sendSASLInitialResponseMessage = /* @__PURE__ */ __name(function(mechanism, initialResponse) {
      writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
      return writer.flush(
        112
        /* code.startup */
      );
    }, "sendSASLInitialResponseMessage");
    var sendSCRAMClientFinalMessage = /* @__PURE__ */ __name(function(additionalData) {
      return writer.addString(additionalData).flush(
        112
        /* code.startup */
      );
    }, "sendSCRAMClientFinalMessage");
    var query = /* @__PURE__ */ __name((text) => {
      return writer.addCString(text).flush(
        81
        /* code.query */
      );
    }, "query");
    var emptyArray = [];
    var parse = /* @__PURE__ */ __name((query2) => {
      const name2 = query2.name || "";
      if (name2.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", name2, name2.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      const types3 = query2.types || emptyArray;
      const len = types3.length;
      const buffer = writer.addCString(name2).addCString(query2.text).addInt16(len);
      for (let i = 0; i < len; i++) {
        buffer.addInt32(types3[i]);
      }
      return writer.flush(
        80
        /* code.parse */
      );
    }, "parse");
    var paramWriter = new buffer_writer_1.Writer();
    var writeValues = /* @__PURE__ */ __name(function(values, valueMapper) {
      for (let i = 0; i < values.length; i++) {
        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
        if (mappedVal == null) {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(-1);
        } else if (mappedVal instanceof Buffer) {
          writer.addInt16(
            1
            /* ParamType.BINARY */
          );
          paramWriter.addInt32(mappedVal.length);
          paramWriter.add(mappedVal);
        } else {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(Buffer.byteLength(mappedVal));
          paramWriter.addString(mappedVal);
        }
      }
    }, "writeValues");
    var bind = /* @__PURE__ */ __name((config = {}) => {
      const portal = config.portal || "";
      const statement = config.statement || "";
      const binary = config.binary || false;
      const values = config.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      writeValues(values, config.valueMapper);
      writer.addInt16(len);
      writer.add(paramWriter.flush());
      writer.addInt16(1);
      writer.addInt16(
        binary ? 1 : 0
        /* ParamType.STRING */
      );
      return writer.flush(
        66
        /* code.bind */
      );
    }, "bind");
    var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
    var execute = /* @__PURE__ */ __name((config) => {
      if (!config || !config.portal && !config.rows) {
        return emptyExecute;
      }
      const portal = config.portal || "";
      const rows = config.rows || 0;
      const portalLength = Buffer.byteLength(portal);
      const len = 4 + portalLength + 1 + 4;
      const buff = Buffer.allocUnsafe(1 + len);
      buff[0] = 69;
      buff.writeInt32BE(len, 1);
      buff.write(portal, 5, "utf-8");
      buff[portalLength + 5] = 0;
      buff.writeUInt32BE(rows, buff.length - 4);
      return buff;
    }, "execute");
    var cancel = /* @__PURE__ */ __name((processID, secretKey) => {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32BE(16, 0);
      buffer.writeInt16BE(1234, 4);
      buffer.writeInt16BE(5678, 6);
      buffer.writeInt32BE(processID, 8);
      buffer.writeInt32BE(secretKey, 12);
      return buffer;
    }, "cancel");
    var cstringMessage = /* @__PURE__ */ __name((code, string) => {
      const stringLen = Buffer.byteLength(string);
      const len = 4 + stringLen + 1;
      const buffer = Buffer.allocUnsafe(1 + len);
      buffer[0] = code;
      buffer.writeInt32BE(len, 1);
      buffer.write(string, 5, "utf-8");
      buffer[len] = 0;
      return buffer;
    }, "cstringMessage");
    var emptyDescribePortal = writer.addCString("P").flush(
      68
      /* code.describe */
    );
    var emptyDescribeStatement = writer.addCString("S").flush(
      68
      /* code.describe */
    );
    var describe = /* @__PURE__ */ __name((msg) => {
      return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
    }, "describe");
    var close = /* @__PURE__ */ __name((msg) => {
      const text = `${msg.type}${msg.name || ""}`;
      return cstringMessage(67, text);
    }, "close");
    var copyData = /* @__PURE__ */ __name((chunk) => {
      return writer.add(chunk).flush(
        100
        /* code.copyFromChunk */
      );
    }, "copyData");
    var copyFail = /* @__PURE__ */ __name((message) => {
      return cstringMessage(102, message);
    }, "copyFail");
    var codeOnlyBuffer = /* @__PURE__ */ __name((code) => Buffer.from([code, 0, 0, 0, 4]), "codeOnlyBuffer");
    var flushBuffer = codeOnlyBuffer(
      72
      /* code.flush */
    );
    var syncBuffer = codeOnlyBuffer(
      83
      /* code.sync */
    );
    var endBuffer = codeOnlyBuffer(
      88
      /* code.end */
    );
    var copyDoneBuffer = codeOnlyBuffer(
      99
      /* code.copyDone */
    );
    var serialize = {
      startup,
      password,
      requestSsl,
      sendSASLInitialResponseMessage,
      sendSCRAMClientFinalMessage,
      query,
      parse,
      bind,
      execute,
      describe,
      close,
      flush: /* @__PURE__ */ __name(() => flushBuffer, "flush"),
      sync: /* @__PURE__ */ __name(() => syncBuffer, "sync"),
      end: /* @__PURE__ */ __name(() => endBuffer, "end"),
      copyData,
      copyDone: /* @__PURE__ */ __name(() => copyDoneBuffer, "copyDone"),
      copyFail,
      cancel
    };
    exports.serialize = serialize;
  }
});

// node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS({
  "node_modules/pg-protocol/dist/buffer-reader.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BufferReader = void 0;
    var BufferReader = class {
      static {
        __name(this, "BufferReader");
      }
      constructor(offset = 0) {
        this.offset = offset;
        this.buffer = Buffer.allocUnsafe(0);
        this.encoding = "utf-8";
      }
      setBuffer(offset, buffer) {
        this.offset = offset;
        this.buffer = buffer;
      }
      int16() {
        const result = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return result;
      }
      byte() {
        const result = this.buffer[this.offset];
        this.offset++;
        return result;
      }
      int32() {
        const result = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      string(length) {
        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
      cstring() {
        const start = this.offset;
        let end = start;
        while (this.buffer[end++] !== 0) {
        }
        this.offset = end;
        return this.buffer.toString(this.encoding, start, end - 1);
      }
      bytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
    };
    exports.BufferReader = BufferReader;
  }
});

// node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS({
  "node_modules/pg-protocol/dist/parser.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = void 0;
    var messages_1 = require_messages();
    var buffer_reader_1 = require_buffer_reader();
    var CODE_LENGTH = 1;
    var LEN_LENGTH = 4;
    var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
    var LATEINIT_LENGTH = -1;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var Parser = class {
      static {
        __name(this, "Parser");
      }
      constructor(opts) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
        this.reader = new buffer_reader_1.BufferReader();
        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
          throw new Error("Binary mode not supported yet");
        }
        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
      }
      parse(buffer, callback) {
        this.mergeBuffer(buffer);
        const bufferFullLength = this.bufferOffset + this.bufferLength;
        let offset = this.bufferOffset;
        while (offset + HEADER_LENGTH <= bufferFullLength) {
          const code = this.buffer[offset];
          const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
          const fullMessageLength = CODE_LENGTH + length;
          if (fullMessageLength + offset <= bufferFullLength) {
            const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
            callback(message);
            offset += fullMessageLength;
          } else {
            break;
          }
        }
        if (offset === bufferFullLength) {
          this.buffer = emptyBuffer;
          this.bufferLength = 0;
          this.bufferOffset = 0;
        } else {
          this.bufferLength = bufferFullLength - offset;
          this.bufferOffset = offset;
        }
      }
      mergeBuffer(buffer) {
        if (this.bufferLength > 0) {
          const newLength = this.bufferLength + buffer.byteLength;
          const newFullLength = newLength + this.bufferOffset;
          if (newFullLength > this.buffer.byteLength) {
            let newBuffer;
            if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
              newBuffer = this.buffer;
            } else {
              let newBufferLength = this.buffer.byteLength * 2;
              while (newLength >= newBufferLength) {
                newBufferLength *= 2;
              }
              newBuffer = Buffer.allocUnsafe(newBufferLength);
            }
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
            this.buffer = newBuffer;
            this.bufferOffset = 0;
          }
          buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
          this.bufferLength = newLength;
        } else {
          this.buffer = buffer;
          this.bufferOffset = 0;
          this.bufferLength = buffer.byteLength;
        }
      }
      handlePacket(offset, code, length, bytes) {
        const { reader } = this;
        reader.setBuffer(offset, bytes);
        let message;
        switch (code) {
          case 50:
            message = messages_1.bindComplete;
            break;
          case 49:
            message = messages_1.parseComplete;
            break;
          case 51:
            message = messages_1.closeComplete;
            break;
          case 110:
            message = messages_1.noData;
            break;
          case 115:
            message = messages_1.portalSuspended;
            break;
          case 99:
            message = messages_1.copyDone;
            break;
          case 87:
            message = messages_1.replicationStart;
            break;
          case 73:
            message = messages_1.emptyQuery;
            break;
          case 68:
            message = parseDataRowMessage(reader);
            break;
          case 67:
            message = parseCommandCompleteMessage(reader);
            break;
          case 90:
            message = parseReadyForQueryMessage(reader);
            break;
          case 65:
            message = parseNotificationMessage(reader);
            break;
          case 82:
            message = parseAuthenticationResponse(reader, length);
            break;
          case 83:
            message = parseParameterStatusMessage(reader);
            break;
          case 75:
            message = parseBackendKeyData(reader);
            break;
          case 69:
            message = parseErrorMessage(reader, "error");
            break;
          case 78:
            message = parseErrorMessage(reader, "notice");
            break;
          case 84:
            message = parseRowDescriptionMessage(reader);
            break;
          case 116:
            message = parseParameterDescriptionMessage(reader);
            break;
          case 71:
            message = parseCopyInMessage(reader);
            break;
          case 72:
            message = parseCopyOutMessage(reader);
            break;
          case 100:
            message = parseCopyData(reader, length);
            break;
          default:
            return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
        }
        reader.setBuffer(0, emptyBuffer);
        message.length = length;
        return message;
      }
    };
    exports.Parser = Parser;
    var parseReadyForQueryMessage = /* @__PURE__ */ __name((reader) => {
      const status = reader.string(1);
      return new messages_1.ReadyForQueryMessage(LATEINIT_LENGTH, status);
    }, "parseReadyForQueryMessage");
    var parseCommandCompleteMessage = /* @__PURE__ */ __name((reader) => {
      const text = reader.cstring();
      return new messages_1.CommandCompleteMessage(LATEINIT_LENGTH, text);
    }, "parseCommandCompleteMessage");
    var parseCopyData = /* @__PURE__ */ __name((reader, length) => {
      const chunk = reader.bytes(length - 4);
      return new messages_1.CopyDataMessage(LATEINIT_LENGTH, chunk);
    }, "parseCopyData");
    var parseCopyInMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyInResponse"), "parseCopyInMessage");
    var parseCopyOutMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyOutResponse"), "parseCopyOutMessage");
    var parseCopyMessage = /* @__PURE__ */ __name((reader, messageName) => {
      const isBinary = reader.byte() !== 0;
      const columnCount = reader.int16();
      const message = new messages_1.CopyResponse(LATEINIT_LENGTH, messageName, isBinary, columnCount);
      for (let i = 0; i < columnCount; i++) {
        message.columnTypes[i] = reader.int16();
      }
      return message;
    }, "parseCopyMessage");
    var parseNotificationMessage = /* @__PURE__ */ __name((reader) => {
      const processId = reader.int32();
      const channel = reader.cstring();
      const payload = reader.cstring();
      return new messages_1.NotificationResponseMessage(LATEINIT_LENGTH, processId, channel, payload);
    }, "parseNotificationMessage");
    var parseRowDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const message = new messages_1.RowDescriptionMessage(LATEINIT_LENGTH, fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        message.fields[i] = parseField(reader);
      }
      return message;
    }, "parseRowDescriptionMessage");
    var parseField = /* @__PURE__ */ __name((reader) => {
      const name2 = reader.cstring();
      const tableID = reader.uint32();
      const columnID = reader.int16();
      const dataTypeID = reader.uint32();
      const dataTypeSize = reader.int16();
      const dataTypeModifier = reader.int32();
      const mode = reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name2, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }, "parseField");
    var parseParameterDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const parameterCount = reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(LATEINIT_LENGTH, parameterCount);
      for (let i = 0; i < parameterCount; i++) {
        message.dataTypeIDs[i] = reader.int32();
      }
      return message;
    }, "parseParameterDescriptionMessage");
    var parseDataRowMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const len = reader.int32();
        fields[i] = len === -1 ? null : reader.string(len);
      }
      return new messages_1.DataRowMessage(LATEINIT_LENGTH, fields);
    }, "parseDataRowMessage");
    var parseParameterStatusMessage = /* @__PURE__ */ __name((reader) => {
      const name2 = reader.cstring();
      const value = reader.cstring();
      return new messages_1.ParameterStatusMessage(LATEINIT_LENGTH, name2, value);
    }, "parseParameterStatusMessage");
    var parseBackendKeyData = /* @__PURE__ */ __name((reader) => {
      const processID = reader.int32();
      const secretKey = reader.int32();
      return new messages_1.BackendKeyDataMessage(LATEINIT_LENGTH, processID, secretKey);
    }, "parseBackendKeyData");
    var parseAuthenticationResponse = /* @__PURE__ */ __name((reader, length) => {
      const code = reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(LATEINIT_LENGTH, salt);
          }
          break;
        case 10:
          {
            message.name = "authenticationSASL";
            message.mechanisms = [];
            let mechanism;
            do {
              mechanism = reader.cstring();
              if (mechanism) {
                message.mechanisms.push(mechanism);
              }
            } while (mechanism);
          }
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }, "parseAuthenticationResponse");
    var parseErrorMessage = /* @__PURE__ */ __name((reader, name2) => {
      const fields = {};
      let fieldType = reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = reader.cstring();
        fieldType = reader.string(1);
      }
      const messageValue = fields.M;
      const message = name2 === "notice" ? new messages_1.NoticeMessage(LATEINIT_LENGTH, messageValue) : new messages_1.DatabaseError(messageValue, LATEINIT_LENGTH, name2);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }, "parseErrorMessage");
  }
});

// node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS({
  "node_modules/pg-protocol/dist/index.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DatabaseError = exports.serialize = exports.parse = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return messages_1.DatabaseError;
    }, "get") });
    var serializer_1 = require_serializer();
    Object.defineProperty(exports, "serialize", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return serializer_1.serialize;
    }, "get") });
    var parser_1 = require_parser();
    function parse(stream, callback) {
      const parser = new parser_1.Parser();
      stream.on("data", (buffer) => parser.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    __name(parse, "parse");
    exports.parse = parse;
  }
});

// node_modules/pg-cloudflare/dist/empty.js
var require_empty = __commonJS({
  "node_modules/pg-cloudflare/dist/empty.js"(exports) {
    "use strict";
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {};
  }
});

// node_modules/pg/lib/stream.js
var require_stream = __commonJS({
  "node_modules/pg/lib/stream.js"(exports, module) {
    init_esm();
    var { getStream, getSecureStream } = getStreamFuncs();
    module.exports = {
      /**
       * Get a socket stream compatible with the current runtime environment.
       * @returns {Duplex}
       */
      getStream,
      /**
       * Get a TLS secured socket, compatible with the current environment,
       * using the socket and other settings given in `options`.
       * @returns {Duplex}
       */
      getSecureStream
    };
    function getNodejsStreamFuncs() {
      function getStream2(ssl) {
        const net = __require("net");
        return new net.Socket();
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        const tls = __require("tls");
        return tls.connect(options);
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getNodejsStreamFuncs, "getNodejsStreamFuncs");
    function getCloudflareStreamFuncs() {
      function getStream2(ssl) {
        const { CloudflareSocket } = require_empty();
        return new CloudflareSocket(ssl);
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        options.socket.startTls(options);
        return options.socket;
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getCloudflareStreamFuncs, "getCloudflareStreamFuncs");
    function isCloudflareRuntime() {
      if (typeof navigator === "object" && navigator !== null && typeof navigator.userAgent === "string") {
        return navigator.userAgent === "Cloudflare-Workers";
      }
      if (typeof Response === "function") {
        const resp = new Response(null, { cf: { thing: true } });
        if (typeof resp.cf === "object" && resp.cf !== null && resp.cf.thing) {
          return true;
        }
      }
      return false;
    }
    __name(isCloudflareRuntime, "isCloudflareRuntime");
    function getStreamFuncs() {
      if (isCloudflareRuntime()) {
        return getCloudflareStreamFuncs();
      }
      return getNodejsStreamFuncs();
    }
    __name(getStreamFuncs, "getStreamFuncs");
  }
});

// node_modules/pg/lib/connection.js
var require_connection = __commonJS({
  "node_modules/pg/lib/connection.js"(exports, module) {
    "use strict";
    init_esm();
    var EventEmitter = __require("events").EventEmitter;
    var { parse, serialize } = require_dist();
    var { getStream, getSecureStream } = require_stream();
    var flushBuffer = serialize.flush();
    var syncBuffer = serialize.sync();
    var endBuffer = serialize.end();
    var Connection2 = class extends EventEmitter {
      static {
        __name(this, "Connection");
      }
      constructor(config) {
        super();
        config = config || {};
        this.stream = config.stream || getStream(config.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config);
        }
        this._keepAlive = config.keepAlive;
        this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
        this.parsedStatements = {};
        this.ssl = config.ssl || false;
        this._ending = false;
        this._emitMessage = false;
        const self = this;
        this.on("newListener", function(eventName) {
          if (eventName === "message") {
            self._emitMessage = true;
          }
        });
      }
      connect(port, host) {
        const self = this;
        this._connecting = true;
        this.stream.setNoDelay(true);
        this.stream.connect(port, host);
        this.stream.once("connect", function() {
          if (self._keepAlive) {
            self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
          }
          self.emit("connect");
        });
        const reportStreamError = /* @__PURE__ */ __name(function(error) {
          if (self._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
            return;
          }
          self.emit("error", error);
        }, "reportStreamError");
        this.stream.on("error", reportStreamError);
        this.stream.on("close", function() {
          self.emit("end");
        });
        if (!this.ssl) {
          return this.attachListeners(this.stream);
        }
        this.stream.once("data", function(buffer) {
          const responseCode = buffer.toString("utf8");
          switch (responseCode) {
            case "S":
              break;
            case "N":
              self.stream.end();
              return self.emit("error", new Error("The server does not support SSL connections"));
            default:
              self.stream.end();
              return self.emit("error", new Error("There was an error establishing an SSL connection"));
          }
          const options = {
            socket: self.stream
          };
          if (self.ssl !== true) {
            Object.assign(options, self.ssl);
            if ("key" in self.ssl) {
              options.key = self.ssl.key;
            }
          }
          const net = __require("net");
          if (net.isIP && net.isIP(host) === 0) {
            options.servername = host;
          }
          try {
            self.stream = getSecureStream(options);
          } catch (err) {
            return self.emit("error", err);
          }
          self.attachListeners(self.stream);
          self.stream.on("error", reportStreamError);
          self.emit("sslconnect");
        });
      }
      attachListeners(stream) {
        parse(stream, (msg) => {
          const eventName = msg.name === "error" ? "errorMessage" : msg.name;
          if (this._emitMessage) {
            this.emit("message", msg);
          }
          this.emit(eventName, msg);
        });
      }
      requestSsl() {
        this.stream.write(serialize.requestSsl());
      }
      startup(config) {
        this.stream.write(serialize.startup(config));
      }
      cancel(processID, secretKey) {
        this._send(serialize.cancel(processID, secretKey));
      }
      password(password) {
        this._send(serialize.password(password));
      }
      sendSASLInitialResponseMessage(mechanism, initialResponse) {
        this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
      }
      sendSCRAMClientFinalMessage(additionalData) {
        this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
      }
      _send(buffer) {
        if (!this.stream.writable) {
          return false;
        }
        return this.stream.write(buffer);
      }
      query(text) {
        this._send(serialize.query(text));
      }
      // send parse message
      parse(query) {
        this._send(serialize.parse(query));
      }
      // send bind message
      bind(config) {
        this._send(serialize.bind(config));
      }
      // send execute message
      execute(config) {
        this._send(serialize.execute(config));
      }
      flush() {
        if (this.stream.writable) {
          this.stream.write(flushBuffer);
        }
      }
      sync() {
        this._ending = true;
        this._send(syncBuffer);
      }
      ref() {
        this.stream.ref();
      }
      unref() {
        this.stream.unref();
      }
      end() {
        this._ending = true;
        if (!this._connecting || !this.stream.writable) {
          this.stream.end();
          return;
        }
        return this.stream.write(endBuffer, () => {
          this.stream.end();
        });
      }
      close(msg) {
        this._send(serialize.close(msg));
      }
      describe(msg) {
        this._send(serialize.describe(msg));
      }
      sendCopyFromChunk(chunk) {
        this._send(serialize.copyData(chunk));
      }
      endCopyFrom() {
        this._send(serialize.copyDone());
      }
      sendCopyFail(msg) {
        this._send(serialize.copyFail(msg));
      }
    };
    module.exports = Connection2;
  }
});

// node_modules/split2/index.js
var require_split2 = __commonJS({
  "node_modules/split2/index.js"(exports, module) {
    "use strict";
    init_esm();
    var { Transform } = __require("stream");
    var { StringDecoder } = __require("string_decoder");
    var kLast = Symbol("last");
    var kDecoder = Symbol("decoder");
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error("maximum buffer reached"));
        return;
      }
      cb();
    }
    __name(transform, "transform");
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    __name(flush, "flush");
    function push(self, val) {
      if (val !== void 0) {
        self.push(val);
      }
    }
    __name(push, "push");
    function noop(incoming) {
      return incoming;
    }
    __name(noop, "noop");
    function split(matcher, mapper, options) {
      matcher = matcher || /\r?\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === "function") {
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\r?\n/;
          }
          break;
        case 2:
          if (typeof matcher === "function") {
            options = mapper;
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof mapper === "object") {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform(options);
      stream[kLast] = "";
      stream[kDecoder] = new StringDecoder("utf8");
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function(err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    __name(split, "split");
    module.exports = split;
  }
});

// node_modules/pgpass/lib/helper.js
var require_helper = __commonJS({
  "node_modules/pgpass/lib/helper.js"(exports, module) {
    "use strict";
    init_esm();
    var path = __require("path");
    var Stream = __require("stream").Stream;
    var split = require_split2();
    var util = __require("util");
    var defaultPort = 5432;
    var isWin = process.platform === "win32";
    var warnStream = process.stderr;
    var S_IRWXG = 56;
    var S_IRWXO = 7;
    var S_IFMT = 61440;
    var S_IFREG = 32768;
    function isRegFile(mode) {
      return (mode & S_IFMT) == S_IFREG;
    }
    __name(isRegFile, "isRegFile");
    var fieldNames = ["host", "port", "database", "user", "password"];
    var nrOfFields = fieldNames.length;
    var passKey = fieldNames[nrOfFields - 1];
    function warn() {
      var isWritable = warnStream instanceof Stream && true === warnStream.writable;
      if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\n");
        warnStream.write(util.format.apply(util, args));
      }
    }
    __name(warn, "warn");
    Object.defineProperty(module.exports, "isWin", {
      get: /* @__PURE__ */ __name(function() {
        return isWin;
      }, "get"),
      set: /* @__PURE__ */ __name(function(val) {
        isWin = val;
      }, "set")
    });
    module.exports.warnTo = function(stream) {
      var old = warnStream;
      warnStream = stream;
      return old;
    };
    module.exports.getFileName = function(rawEnv) {
      var env = rawEnv || process.env;
      var file = env.PGPASSFILE || (isWin ? path.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env.HOME || "./", ".pgpass"));
      return file;
    };
    module.exports.usePgPass = function(stats, fname) {
      if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
        return false;
      }
      if (isWin) {
        return true;
      }
      fname = fname || "<unkn>";
      if (!isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
      }
      if (stats.mode & (S_IRWXG | S_IRWXO)) {
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
      }
      return true;
    };
    var matcher = module.exports.match = function(connInfo, entry) {
      return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
        if (idx == 1) {
          if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
            return prev && true;
          }
        }
        return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
      }, true);
    };
    module.exports.getPassword = function(connInfo, stream, cb) {
      var pass;
      var lineStream = stream.pipe(split());
      function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
          pass = entry[passKey];
          lineStream.end();
        }
      }
      __name(onLine, "onLine");
      var onEnd = /* @__PURE__ */ __name(function() {
        stream.destroy();
        cb(pass);
      }, "onEnd");
      var onErr = /* @__PURE__ */ __name(function(err) {
        stream.destroy();
        warn("WARNING: error on reading file: %s", err);
        cb(void 0);
      }, "onErr");
      stream.on("error", onErr);
      lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
    };
    var parseLine = module.exports.parseLine = function(line) {
      if (line.length < 11 || line.match(/^\s+#/)) {
        return null;
      }
      var curChar = "";
      var prevChar = "";
      var fieldIdx = 0;
      var startIdx = 0;
      var endIdx = 0;
      var obj = {};
      var isLastField = false;
      var addToObj = /* @__PURE__ */ __name(function(idx, i0, i1) {
        var field = line.substring(i0, i1);
        if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
          field = field.replace(/\\([:\\])/g, "$1");
        }
        obj[fieldNames[idx]] = field;
      }, "addToObj");
      for (var i = 0; i < line.length - 1; i += 1) {
        curChar = line.charAt(i + 1);
        prevChar = line.charAt(i);
        isLastField = fieldIdx == nrOfFields - 1;
        if (isLastField) {
          addToObj(fieldIdx, startIdx);
          break;
        }
        if (i >= 0 && curChar == ":" && prevChar !== "\\") {
          addToObj(fieldIdx, startIdx, i + 1);
          startIdx = i + 2;
          fieldIdx += 1;
        }
      }
      obj = Object.keys(obj).length === nrOfFields ? obj : null;
      return obj;
    };
    var isValidEntry = module.exports.isValidEntry = function(entry) {
      var rules = {
        // host
        0: function(x) {
          return x.length > 0;
        },
        // port
        1: function(x) {
          if (x === "*") {
            return true;
          }
          x = Number(x);
          return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
        },
        // database
        2: function(x) {
          return x.length > 0;
        },
        // username
        3: function(x) {
          return x.length > 0;
        },
        // password
        4: function(x) {
          return x.length > 0;
        }
      };
      for (var idx = 0; idx < fieldNames.length; idx += 1) {
        var rule = rules[idx];
        var value = entry[fieldNames[idx]] || "";
        var res = rule(value);
        if (!res) {
          return false;
        }
      }
      return true;
    };
  }
});

// node_modules/pgpass/lib/index.js
var require_lib = __commonJS({
  "node_modules/pgpass/lib/index.js"(exports, module) {
    "use strict";
    init_esm();
    var path = __require("path");
    var fs = __require("fs");
    var helper = require_helper();
    module.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st = fs.createReadStream(file);
        helper.getPassword(connInfo, st, cb);
      });
    };
    module.exports.warnTo = helper.warnTo;
  }
});

// node_modules/pg/lib/client.js
var require_client = __commonJS({
  "node_modules/pg/lib/client.js"(exports, module) {
    init_esm();
    var EventEmitter = __require("events").EventEmitter;
    var utils = require_utils();
    var nodeUtils = __require("util");
    var sasl = require_sasl();
    var TypeOverrides2 = require_type_overrides();
    var ConnectionParameters = require_connection_parameters();
    var Query2 = require_query();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var crypto2 = require_utils2();
    var activeQueryDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.activeQuery is deprecated and will be removed in pg@9.0"
    );
    var queryQueueDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.queryQueue is deprecated and will be removed in pg@9.0."
    );
    var pgPassDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "pgpass support is deprecated and will be removed in pg@9.0. You can provide an async function as the password property to the Client/Pool constructor that returns a password instead. Within this function you can call the pgpass module in your own code."
    );
    var byoPromiseDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Passing a custom Promise implementation to the Client/Pool constructor is deprecated and will be removed in pg@9.0."
    );
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead."
    );
    var Client2 = class extends EventEmitter {
      static {
        __name(this, "Client");
      }
      constructor(config) {
        super();
        this.connectionParameters = new ConnectionParameters(config);
        this.user = this.connectionParameters.user;
        this.database = this.connectionParameters.database;
        this.port = this.connectionParameters.port;
        this.host = this.connectionParameters.host;
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: this.connectionParameters.password
        });
        this.replication = this.connectionParameters.replication;
        const c = config || {};
        if (c.Promise) {
          byoPromiseDeprecationNotice();
        }
        this._Promise = c.Promise || global.Promise;
        this._types = new TypeOverrides2(c.types);
        this._ending = false;
        this._ended = false;
        this._connecting = false;
        this._connected = false;
        this._connectionError = false;
        this._queryable = true;
        this._activeQuery = null;
        this.enableChannelBinding = Boolean(c.enableChannelBinding);
        this.connection = c.connection || new Connection2({
          stream: c.stream,
          ssl: this.connectionParameters.ssl,
          keepAlive: c.keepAlive || false,
          keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
          encoding: this.connectionParameters.client_encoding || "utf8"
        });
        this._queryQueue = [];
        this.binary = c.binary || defaults2.binary;
        this.processID = null;
        this.secretKey = null;
        this.ssl = this.connectionParameters.ssl || false;
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
      }
      get activeQuery() {
        activeQueryDeprecationNotice();
        return this._activeQuery;
      }
      set activeQuery(val) {
        activeQueryDeprecationNotice();
        this._activeQuery = val;
      }
      _getActiveQuery() {
        return this._activeQuery;
      }
      _errorAllQueries(err) {
        const enqueueError = /* @__PURE__ */ __name((query) => {
          process.nextTick(() => {
            query.handleError(err, this.connection);
          });
        }, "enqueueError");
        const activeQuery = this._getActiveQuery();
        if (activeQuery) {
          enqueueError(activeQuery);
          this._activeQuery = null;
        }
        this._queryQueue.forEach(enqueueError);
        this._queryQueue.length = 0;
      }
      _connect(callback) {
        const self = this;
        const con = this.connection;
        this._connectionCallback = callback;
        if (this._connecting || this._connected) {
          const err = new Error("Client has already been connected. You cannot reuse a client.");
          process.nextTick(() => {
            callback(err);
          });
          return;
        }
        this._connecting = true;
        if (this._connectionTimeoutMillis > 0) {
          this.connectionTimeoutHandle = setTimeout(() => {
            con._ending = true;
            con.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis);
          if (this.connectionTimeoutHandle.unref) {
            this.connectionTimeoutHandle.unref();
          }
        }
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          if (self.ssl) {
            con.requestSsl();
          } else {
            con.startup(self.getStartupConf());
          }
        });
        con.on("sslconnect", function() {
          con.startup(self.getStartupConf());
        });
        this._attachListeners(con);
        con.once("end", () => {
          const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
          clearTimeout(this.connectionTimeoutHandle);
          this._errorAllQueries(error);
          this._ended = true;
          if (!this._ending) {
            if (this._connecting && !this._connectionError) {
              if (this._connectionCallback) {
                this._connectionCallback(error);
              } else {
                this._handleErrorEvent(error);
              }
            } else if (!this._connectionError) {
              this._handleErrorEvent(error);
            }
          }
          process.nextTick(() => {
            this.emit("end");
          });
        });
      }
      connect(callback) {
        if (callback) {
          this._connect(callback);
          return;
        }
        return new this._Promise((resolve, reject) => {
          this._connect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(this);
            }
          });
        });
      }
      _attachListeners(con) {
        con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
        con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
        con.on("authenticationSASL", this._handleAuthSASL.bind(this));
        con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
        con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
        con.on("backendKeyData", this._handleBackendKeyData.bind(this));
        con.on("error", this._handleErrorEvent.bind(this));
        con.on("errorMessage", this._handleErrorMessage.bind(this));
        con.on("readyForQuery", this._handleReadyForQuery.bind(this));
        con.on("notice", this._handleNotice.bind(this));
        con.on("rowDescription", this._handleRowDescription.bind(this));
        con.on("dataRow", this._handleDataRow.bind(this));
        con.on("portalSuspended", this._handlePortalSuspended.bind(this));
        con.on("emptyQuery", this._handleEmptyQuery.bind(this));
        con.on("commandComplete", this._handleCommandComplete.bind(this));
        con.on("parseComplete", this._handleParseComplete.bind(this));
        con.on("copyInResponse", this._handleCopyInResponse.bind(this));
        con.on("copyData", this._handleCopyData.bind(this));
        con.on("notification", this._handleNotification.bind(this));
      }
      _getPassword(cb) {
        const con = this.connection;
        if (typeof this.password === "function") {
          this._Promise.resolve().then(() => this.password(this.connectionParameters)).then((pass) => {
            if (pass !== void 0) {
              if (typeof pass !== "string") {
                con.emit("error", new TypeError("Password must be a string"));
                return;
              }
              this.connectionParameters.password = this.password = pass;
            } else {
              this.connectionParameters.password = this.password = null;
            }
            cb();
          }).catch((err) => {
            con.emit("error", err);
          });
        } else if (this.password !== null) {
          cb();
        } else {
          try {
            const pgPass = require_lib();
            pgPass(this.connectionParameters, (pass) => {
              if (void 0 !== pass) {
                pgPassDeprecationNotice();
                this.connectionParameters.password = this.password = pass;
              }
              cb();
            });
          } catch (e) {
            this.emit("error", e);
          }
        }
      }
      _handleAuthCleartextPassword(msg) {
        this._getPassword(() => {
          this.connection.password(this.password);
        });
      }
      _handleAuthMD5Password(msg) {
        this._getPassword(async () => {
          try {
            const hashedPassword = await crypto2.postgresMd5PasswordHash(this.user, this.password, msg.salt);
            this.connection.password(hashedPassword);
          } catch (e) {
            this.emit("error", e);
          }
        });
      }
      _handleAuthSASL(msg) {
        this._getPassword(() => {
          try {
            this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
            this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
          } catch (err) {
            this.connection.emit("error", err);
          }
        });
      }
      async _handleAuthSASLContinue(msg) {
        try {
          await sasl.continueSession(
            this.saslSession,
            this.password,
            msg.data,
            this.enableChannelBinding && this.connection.stream
          );
          this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleAuthSASLFinal(msg) {
        try {
          sasl.finalizeSession(this.saslSession, msg.data);
          this.saslSession = null;
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleBackendKeyData(msg) {
        this.processID = msg.processID;
        this.secretKey = msg.secretKey;
      }
      _handleReadyForQuery(msg) {
        if (this._connecting) {
          this._connecting = false;
          this._connected = true;
          clearTimeout(this.connectionTimeoutHandle);
          if (this._connectionCallback) {
            this._connectionCallback(null, this);
            this._connectionCallback = null;
          }
          this.emit("connect");
        }
        const activeQuery = this._getActiveQuery();
        this._activeQuery = null;
        this.readyForQuery = true;
        if (activeQuery) {
          activeQuery.handleReadyForQuery(this.connection);
        }
        this._pulseQueryQueue();
      }
      // if we receive an error event or error message
      // during the connection process we handle it here
      _handleErrorWhileConnecting(err) {
        if (this._connectionError) {
          return;
        }
        this._connectionError = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          return this._connectionCallback(err);
        }
        this.emit("error", err);
      }
      // if we're connected and we receive an error event from the connection
      // this means the socket is dead - do a hard abort of all queries and emit
      // the socket error on the client as well
      _handleErrorEvent(err) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(err);
        }
        this._queryable = false;
        this._errorAllQueries(err);
        this.emit("error", err);
      }
      // handle error messages from the postgres backend
      _handleErrorMessage(msg) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(msg);
        }
        const activeQuery = this._getActiveQuery();
        if (!activeQuery) {
          this._handleErrorEvent(msg);
          return;
        }
        this._activeQuery = null;
        activeQuery.handleError(msg, this.connection);
      }
      _handleRowDescription(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected rowDescription message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleRowDescription(msg);
      }
      _handleDataRow(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected dataRow message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleDataRow(msg);
      }
      _handlePortalSuspended(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected portalSuspended message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handlePortalSuspended(this.connection);
      }
      _handleEmptyQuery(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected emptyQuery message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleEmptyQuery(this.connection);
      }
      _handleCommandComplete(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected commandComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCommandComplete(msg, this.connection);
      }
      _handleParseComplete() {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected parseComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        if (activeQuery.name) {
          this.connection.parsedStatements[activeQuery.name] = activeQuery.text;
        }
      }
      _handleCopyInResponse(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyInResponse message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyInResponse(this.connection);
      }
      _handleCopyData(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyData message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyData(msg, this.connection);
      }
      _handleNotification(msg) {
        this.emit("notification", msg);
      }
      _handleNotice(msg) {
        this.emit("notice", msg);
      }
      getStartupConf() {
        const params = this.connectionParameters;
        const data = {
          user: params.user,
          database: params.database
        };
        const appName = params.application_name || params.fallback_application_name;
        if (appName) {
          data.application_name = appName;
        }
        if (params.replication) {
          data.replication = "" + params.replication;
        }
        if (params.statement_timeout) {
          data.statement_timeout = String(parseInt(params.statement_timeout, 10));
        }
        if (params.lock_timeout) {
          data.lock_timeout = String(parseInt(params.lock_timeout, 10));
        }
        if (params.idle_in_transaction_session_timeout) {
          data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
        }
        if (params.options) {
          data.options = params.options;
        }
        return data;
      }
      cancel(client, query) {
        if (client.activeQuery === query) {
          const con = this.connection;
          if (this.host && this.host.indexOf("/") === 0) {
            con.connect(this.host + "/.s.PGSQL." + this.port);
          } else {
            con.connect(this.port, this.host);
          }
          con.on("connect", function() {
            con.cancel(client.processID, client.secretKey);
          });
        } else if (client._queryQueue.indexOf(query) !== -1) {
          client._queryQueue.splice(client._queryQueue.indexOf(query), 1);
        }
      }
      setTypeParser(oid, format, parseFn) {
        return this._types.setTypeParser(oid, format, parseFn);
      }
      getTypeParser(oid, format) {
        return this._types.getTypeParser(oid, format);
      }
      // escapeIdentifier and escapeLiteral moved to utility functions & exported
      // on PG
      // re-exported here for backwards compatibility
      escapeIdentifier(str) {
        return utils.escapeIdentifier(str);
      }
      escapeLiteral(str) {
        return utils.escapeLiteral(str);
      }
      _pulseQueryQueue() {
        if (this.readyForQuery === true) {
          this._activeQuery = this._queryQueue.shift();
          const activeQuery = this._getActiveQuery();
          if (activeQuery) {
            this.readyForQuery = false;
            this.hasExecuted = true;
            const queryError = activeQuery.submit(this.connection);
            if (queryError) {
              process.nextTick(() => {
                activeQuery.handleError(queryError, this.connection);
                this.readyForQuery = true;
                this._pulseQueryQueue();
              });
            }
          } else if (this.hasExecuted) {
            this._activeQuery = null;
            this.emit("drain");
          }
        }
      }
      query(config, values, callback) {
        let query;
        let result;
        let readTimeout;
        let readTimeoutTimer;
        let queryCallback;
        if (config === null || config === void 0) {
          throw new TypeError("Client was passed a null or undefined query");
        } else if (typeof config.submit === "function") {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          result = query = config;
          if (!query.callback) {
            if (typeof values === "function") {
              query.callback = values;
            } else if (callback) {
              query.callback = callback;
            }
          }
        } else {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          query = new Query2(config, values, callback);
          if (!query.callback) {
            result = new this._Promise((resolve, reject) => {
              query.callback = (err, res) => err ? reject(err) : resolve(res);
            }).catch((err) => {
              Error.captureStackTrace(err);
              throw err;
            });
          }
        }
        if (readTimeout) {
          queryCallback = query.callback || (() => {
          });
          readTimeoutTimer = setTimeout(() => {
            const error = new Error("Query read timeout");
            process.nextTick(() => {
              query.handleError(error, this.connection);
            });
            queryCallback(error);
            query.callback = () => {
            };
            const index = this._queryQueue.indexOf(query);
            if (index > -1) {
              this._queryQueue.splice(index, 1);
            }
            this._pulseQueryQueue();
          }, readTimeout);
          query.callback = (err, res) => {
            clearTimeout(readTimeoutTimer);
            queryCallback(err, res);
          };
        }
        if (this.binary && !query.binary) {
          query.binary = true;
        }
        if (query._result && !query._result._types) {
          query._result._types = this._types;
        }
        if (!this._queryable) {
          process.nextTick(() => {
            query.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._ending) {
          process.nextTick(() => {
            query.handleError(new Error("Client was closed and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._queryQueue.length > 0) {
          queryQueueLengthDeprecationNotice();
        }
        this._queryQueue.push(query);
        this._pulseQueryQueue();
        return result;
      }
      ref() {
        this.connection.ref();
      }
      unref() {
        this.connection.unref();
      }
      end(cb) {
        this._ending = true;
        if (!this.connection._connecting || this._ended) {
          if (cb) {
            cb();
          } else {
            return this._Promise.resolve();
          }
        }
        if (this._getActiveQuery() || !this._queryable) {
          this.connection.stream.destroy();
        } else {
          this.connection.end();
        }
        if (cb) {
          this.connection.once("end", cb);
        } else {
          return new this._Promise((resolve) => {
            this.connection.once("end", resolve);
          });
        }
      }
      get queryQueue() {
        queryQueueDeprecationNotice();
        return this._queryQueue;
      }
    };
    Client2.Query = Query2;
    module.exports = Client2;
  }
});

// node_modules/pg-pool/index.js
var require_pg_pool = __commonJS({
  "node_modules/pg-pool/index.js"(exports, module) {
    "use strict";
    init_esm();
    var EventEmitter = __require("events").EventEmitter;
    var NOOP = /* @__PURE__ */ __name(function() {
    }, "NOOP");
    var removeWhere = /* @__PURE__ */ __name((list, predicate) => {
      const i = list.findIndex(predicate);
      return i === -1 ? void 0 : list.splice(i, 1)[0];
    }, "removeWhere");
    var IdleItem = class {
      static {
        __name(this, "IdleItem");
      }
      constructor(client, idleListener, timeoutId) {
        this.client = client;
        this.idleListener = idleListener;
        this.timeoutId = timeoutId;
      }
    };
    var PendingItem = class {
      static {
        __name(this, "PendingItem");
      }
      constructor(callback) {
        this.callback = callback;
      }
    };
    function throwOnDoubleRelease() {
      throw new Error("Release called on client which has already been released to the pool.");
    }
    __name(throwOnDoubleRelease, "throwOnDoubleRelease");
    function promisify(Promise2, callback) {
      if (callback) {
        return { callback, result: void 0 };
      }
      let rej;
      let res;
      const cb = /* @__PURE__ */ __name(function(err, client) {
        err ? rej(err) : res(client);
      }, "cb");
      const result = new Promise2(function(resolve, reject) {
        res = resolve;
        rej = reject;
      }).catch((err) => {
        Error.captureStackTrace(err);
        throw err;
      });
      return { callback: cb, result };
    }
    __name(promisify, "promisify");
    function makeIdleListener(pool, client) {
      return /* @__PURE__ */ __name(function idleListener(err) {
        err.client = client;
        client.removeListener("error", idleListener);
        client.on("error", () => {
          pool.log("additional client error after disconnection due to error", err);
        });
        pool._remove(client);
        pool.emit("error", err, client);
      }, "idleListener");
    }
    __name(makeIdleListener, "makeIdleListener");
    var Pool2 = class extends EventEmitter {
      static {
        __name(this, "Pool");
      }
      constructor(options, Client2) {
        super();
        this.options = Object.assign({}, options);
        if (options != null && "password" in options) {
          Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: options.password
          });
        }
        if (options != null && options.ssl && options.ssl.key) {
          Object.defineProperty(this.options.ssl, "key", {
            enumerable: false
          });
        }
        this.options.max = this.options.max || this.options.poolSize || 10;
        this.options.min = this.options.min || 0;
        this.options.maxUses = this.options.maxUses || Infinity;
        this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
        this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
        this.log = this.options.log || function() {
        };
        this.Client = this.options.Client || Client2 || require_lib2().Client;
        this.Promise = this.options.Promise || global.Promise;
        if (typeof this.options.idleTimeoutMillis === "undefined") {
          this.options.idleTimeoutMillis = 1e4;
        }
        this._clients = [];
        this._idle = [];
        this._expired = /* @__PURE__ */ new WeakSet();
        this._pendingQueue = [];
        this._endCallback = void 0;
        this.ending = false;
        this.ended = false;
      }
      _promiseTry(f) {
        const Promise2 = this.Promise;
        if (typeof Promise2.try === "function") {
          return Promise2.try(f);
        }
        return new Promise2((resolve) => resolve(f()));
      }
      _isFull() {
        return this._clients.length >= this.options.max;
      }
      _isAboveMin() {
        return this._clients.length > this.options.min;
      }
      _pulseQueue() {
        this.log("pulse queue");
        if (this.ended) {
          this.log("pulse queue ended");
          return;
        }
        if (this.ending) {
          this.log("pulse queue on ending");
          if (this._idle.length) {
            this._idle.slice().map((item) => {
              this._remove(item.client);
            });
          }
          if (!this._clients.length) {
            this.ended = true;
            this._endCallback();
          }
          return;
        }
        if (!this._pendingQueue.length) {
          this.log("no queued requests");
          return;
        }
        if (!this._idle.length && this._isFull()) {
          return;
        }
        const pendingItem = this._pendingQueue.shift();
        if (this._idle.length) {
          const idleItem = this._idle.pop();
          clearTimeout(idleItem.timeoutId);
          const client = idleItem.client;
          client.ref && client.ref();
          const idleListener = idleItem.idleListener;
          return this._acquireClient(client, pendingItem, idleListener, false);
        }
        if (!this._isFull()) {
          return this.newClient(pendingItem);
        }
        throw new Error("unexpected condition");
      }
      _remove(client, callback) {
        const removed = removeWhere(this._idle, (item) => item.client === client);
        if (removed !== void 0) {
          clearTimeout(removed.timeoutId);
        }
        this._clients = this._clients.filter((c) => c !== client);
        const context = this;
        client.end(() => {
          context.emit("remove", client);
          if (typeof callback === "function") {
            callback();
          }
        });
      }
      connect(cb) {
        if (this.ending) {
          const err = new Error("Cannot use a pool after calling end on the pool");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        const response = promisify(this.Promise, cb);
        const result = response.result;
        if (this._isFull() || this._idle.length) {
          if (this._idle.length) {
            process.nextTick(() => this._pulseQueue());
          }
          if (!this.options.connectionTimeoutMillis) {
            this._pendingQueue.push(new PendingItem(response.callback));
            return result;
          }
          const queueCallback = /* @__PURE__ */ __name((err, res, done) => {
            clearTimeout(tid);
            response.callback(err, res, done);
          }, "queueCallback");
          const pendingItem = new PendingItem(queueCallback);
          const tid = setTimeout(() => {
            removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
            pendingItem.timedOut = true;
            response.callback(new Error("timeout exceeded when trying to connect"));
          }, this.options.connectionTimeoutMillis);
          if (tid.unref) {
            tid.unref();
          }
          this._pendingQueue.push(pendingItem);
          return result;
        }
        this.newClient(new PendingItem(response.callback));
        return result;
      }
      newClient(pendingItem) {
        const client = new this.Client(this.options);
        this._clients.push(client);
        const idleListener = makeIdleListener(this, client);
        this.log("checking client timeout");
        let tid;
        let timeoutHit = false;
        if (this.options.connectionTimeoutMillis) {
          tid = setTimeout(() => {
            if (client.connection) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.connection.stream.destroy();
            } else if (!client.isConnected()) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.end();
            }
          }, this.options.connectionTimeoutMillis);
        }
        this.log("connecting new client");
        client.connect((err) => {
          if (tid) {
            clearTimeout(tid);
          }
          client.on("error", idleListener);
          if (err) {
            this.log("client failed to connect", err);
            this._clients = this._clients.filter((c) => c !== client);
            if (timeoutHit) {
              err = new Error("Connection terminated due to connection timeout", { cause: err });
            }
            this._pulseQueue();
            if (!pendingItem.timedOut) {
              pendingItem.callback(err, void 0, NOOP);
            }
          } else {
            this.log("new client connected");
            if (this.options.onConnect) {
              this._promiseTry(() => this.options.onConnect(client)).then(
                () => {
                  this._afterConnect(client, pendingItem, idleListener);
                },
                (hookErr) => {
                  this._clients = this._clients.filter((c) => c !== client);
                  client.end(() => {
                    this._pulseQueue();
                    if (!pendingItem.timedOut) {
                      pendingItem.callback(hookErr, void 0, NOOP);
                    }
                  });
                }
              );
              return;
            }
            return this._afterConnect(client, pendingItem, idleListener);
          }
        });
      }
      _afterConnect(client, pendingItem, idleListener) {
        if (this.options.maxLifetimeSeconds !== 0) {
          const maxLifetimeTimeout = setTimeout(() => {
            this.log("ending client due to expired lifetime");
            this._expired.add(client);
            const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
            if (idleIndex !== -1) {
              this._acquireClient(
                client,
                new PendingItem((err, client2, clientRelease) => clientRelease()),
                idleListener,
                false
              );
            }
          }, this.options.maxLifetimeSeconds * 1e3);
          maxLifetimeTimeout.unref();
          client.once("end", () => clearTimeout(maxLifetimeTimeout));
        }
        return this._acquireClient(client, pendingItem, idleListener, true);
      }
      // acquire a client for a pending work item
      _acquireClient(client, pendingItem, idleListener, isNew) {
        if (isNew) {
          this.emit("connect", client);
        }
        this.emit("acquire", client);
        client.release = this._releaseOnce(client, idleListener);
        client.removeListener("error", idleListener);
        if (!pendingItem.timedOut) {
          if (isNew && this.options.verify) {
            this.options.verify(client, (err) => {
              if (err) {
                client.release(err);
                return pendingItem.callback(err, void 0, NOOP);
              }
              pendingItem.callback(void 0, client, client.release);
            });
          } else {
            pendingItem.callback(void 0, client, client.release);
          }
        } else {
          if (isNew && this.options.verify) {
            this.options.verify(client, client.release);
          } else {
            client.release();
          }
        }
      }
      // returns a function that wraps _release and throws if called more than once
      _releaseOnce(client, idleListener) {
        let released = false;
        return (err) => {
          if (released) {
            throwOnDoubleRelease();
          }
          released = true;
          this._release(client, idleListener, err);
        };
      }
      // release a client back to the poll, include an error
      // to remove it from the pool
      _release(client, idleListener, err) {
        client.on("error", idleListener);
        client._poolUseCount = (client._poolUseCount || 0) + 1;
        this.emit("release", err, client);
        if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
          if (client._poolUseCount >= this.options.maxUses) {
            this.log("remove expended client");
          }
          return this._remove(client, this._pulseQueue.bind(this));
        }
        const isExpired = this._expired.has(client);
        if (isExpired) {
          this.log("remove expired client");
          this._expired.delete(client);
          return this._remove(client, this._pulseQueue.bind(this));
        }
        let tid;
        if (this.options.idleTimeoutMillis && this._isAboveMin()) {
          tid = setTimeout(() => {
            if (this._isAboveMin()) {
              this.log("remove idle client");
              this._remove(client, this._pulseQueue.bind(this));
            }
          }, this.options.idleTimeoutMillis);
          if (this.options.allowExitOnIdle) {
            tid.unref();
          }
        }
        if (this.options.allowExitOnIdle) {
          client.unref();
        }
        this._idle.push(new IdleItem(client, idleListener, tid));
        this._pulseQueue();
      }
      query(text, values, cb) {
        if (typeof text === "function") {
          const response2 = promisify(this.Promise, text);
          setImmediate(function() {
            return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
          });
          return response2.result;
        }
        if (typeof values === "function") {
          cb = values;
          values = void 0;
        }
        const response = promisify(this.Promise, cb);
        cb = response.callback;
        this.connect((err, client) => {
          if (err) {
            return cb(err);
          }
          let clientReleased = false;
          const onError = /* @__PURE__ */ __name((err2) => {
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            cb(err2);
          }, "onError");
          client.once("error", onError);
          this.log("dispatching query");
          try {
            client.query(text, values, (err2, res) => {
              this.log("query dispatched");
              client.removeListener("error", onError);
              if (clientReleased) {
                return;
              }
              clientReleased = true;
              client.release(err2);
              if (err2) {
                return cb(err2);
              }
              return cb(void 0, res);
            });
          } catch (err2) {
            client.release(err2);
            return cb(err2);
          }
        });
        return response.result;
      }
      end(cb) {
        this.log("ending");
        if (this.ending) {
          const err = new Error("Called end on pool more than once");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        this.ending = true;
        const promised = promisify(this.Promise, cb);
        this._endCallback = promised.callback;
        this._pulseQueue();
        return promised.result;
      }
      get waitingCount() {
        return this._pendingQueue.length;
      }
      get idleCount() {
        return this._idle.length;
      }
      get expiredCount() {
        return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
      }
      get totalCount() {
        return this._clients.length;
      }
    };
    module.exports = Pool2;
  }
});

// node_modules/pg/lib/native/query.js
var require_query2 = __commonJS({
  "node_modules/pg/lib/native/query.js"(exports, module) {
    "use strict";
    init_esm();
    var EventEmitter = __require("events").EventEmitter;
    var util = __require("util");
    var utils = require_utils();
    var NativeQuery = module.exports = function(config, values, callback) {
      EventEmitter.call(this);
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.name = config.name;
      this.queryMode = config.queryMode;
      this.callback = config.callback;
      this.state = "new";
      this._arrayMode = config.rowMode === "array";
      this._emitRowEvents = false;
      this.on(
        "newListener",
        function(event) {
          if (event === "row") this._emitRowEvents = true;
        }.bind(this)
      );
    };
    util.inherits(NativeQuery, EventEmitter);
    var errorFieldMap = {
      sqlState: "code",
      statementPosition: "position",
      messagePrimary: "message",
      context: "where",
      schemaName: "schema",
      tableName: "table",
      columnName: "column",
      dataTypeName: "dataType",
      constraintName: "constraint",
      sourceFile: "file",
      sourceLine: "line",
      sourceFunction: "routine"
    };
    NativeQuery.prototype.handleError = function(err) {
      const fields = this.native.pq.resultErrorFields();
      if (fields) {
        for (const key in fields) {
          const normalizedFieldName = errorFieldMap[key] || key;
          err[normalizedFieldName] = fields[key];
        }
      }
      if (this.callback) {
        this.callback(err);
      } else {
        this.emit("error", err);
      }
      this.state = "error";
    };
    NativeQuery.prototype.then = function(onSuccess, onFailure) {
      return this._getPromise().then(onSuccess, onFailure);
    };
    NativeQuery.prototype.catch = function(callback) {
      return this._getPromise().catch(callback);
    };
    NativeQuery.prototype._getPromise = function() {
      if (this._promise) return this._promise;
      this._promise = new Promise(
        function(resolve, reject) {
          this._once("end", resolve);
          this._once("error", reject);
        }.bind(this)
      );
      return this._promise;
    };
    NativeQuery.prototype.submit = function(client) {
      this.state = "running";
      const self = this;
      this.native = client.native;
      client.native.arrayMode = this._arrayMode;
      let after = /* @__PURE__ */ __name(function(err, rows, results) {
        client.native.arrayMode = false;
        setImmediate(function() {
          self.emit("_done");
        });
        if (err) {
          return self.handleError(err);
        }
        if (self._emitRowEvents) {
          if (results.length > 1) {
            rows.forEach((rowOfRows, i) => {
              rowOfRows.forEach((row) => {
                self.emit("row", row, results[i]);
              });
            });
          } else {
            rows.forEach(function(row) {
              self.emit("row", row, results);
            });
          }
        }
        self.state = "end";
        self.emit("end", results);
        if (self.callback) {
          self.callback(null, results);
        }
      }, "after");
      if (process.domain) {
        after = process.domain.bind(after);
      }
      if (this.name) {
        if (this.name.length > 63) {
          console.error("Warning! Postgres only supports 63 characters for query names.");
          console.error("You supplied %s (%s)", this.name, this.name.length);
          console.error("This can cause conflicts and silent errors executing queries");
        }
        const values = (this.values || []).map(utils.prepareValue);
        if (client.namedQueries[this.name]) {
          if (this.text && client.namedQueries[this.name] !== this.text) {
            const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
            return after(err);
          }
          return client.native.execute(this.name, values, after);
        }
        return client.native.prepare(this.name, this.text, values.length, function(err) {
          if (err) return after(err);
          client.namedQueries[self.name] = self.text;
          return self.native.execute(self.name, values, after);
        });
      } else if (this.values) {
        if (!Array.isArray(this.values)) {
          const err = new Error("Query values must be an array");
          return after(err);
        }
        const vals = this.values.map(utils.prepareValue);
        client.native.query(this.text, vals, after);
      } else if (this.queryMode === "extended") {
        client.native.query(this.text, [], after);
      } else {
        client.native.query(this.text, after);
      }
    };
  }
});

// node_modules/pg/lib/native/client.js
var require_client2 = __commonJS({
  "node_modules/pg/lib/native/client.js"(exports, module) {
    init_esm();
    var nodeUtils = __require("util");
    var Native;
    try {
      Native = __require("pg-native");
    } catch (e) {
      throw e;
    }
    var TypeOverrides2 = require_type_overrides();
    var EventEmitter = __require("events").EventEmitter;
    var util = __require("util");
    var ConnectionParameters = require_connection_parameters();
    var NativeQuery = require_query2();
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use async/await or an external async flow control mechanism instead."
    );
    var Client2 = module.exports = function(config) {
      EventEmitter.call(this);
      config = config || {};
      this._Promise = config.Promise || global.Promise;
      this._types = new TypeOverrides2(config.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp = this.connectionParameters = new ConnectionParameters(config);
      if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
      this.user = cp.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp.password
      });
      this.database = cp.database;
      this.host = cp.host;
      this.port = cp.port;
      this.namedQueries = {};
    };
    Client2.Query = NativeQuery;
    util.inherits(Client2, EventEmitter);
    Client2.prototype._errorAllQueries = function(err) {
      const enqueueError = /* @__PURE__ */ __name((query) => {
        process.nextTick(() => {
          query.native = this.native;
          query.handleError(err);
        });
      }, "enqueueError");
      if (this._hasActiveQuery()) {
        enqueueError(this._activeQuery);
        this._activeQuery = null;
      }
      this._queryQueue.forEach(enqueueError);
      this._queryQueue.length = 0;
    };
    Client2.prototype._connect = function(cb) {
      const self = this;
      if (this._connecting) {
        process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
        return;
      }
      this._connecting = true;
      this.connectionParameters.getLibpqConnectionString(function(err, conString) {
        if (self.connectionParameters.nativeConnectionString) conString = self.connectionParameters.nativeConnectionString;
        if (err) return cb(err);
        self.native.connect(conString, function(err2) {
          if (err2) {
            self.native.end();
            return cb(err2);
          }
          self._connected = true;
          self.native.on("error", function(err3) {
            self._queryable = false;
            self._errorAllQueries(err3);
            self.emit("error", err3);
          });
          self.native.on("notification", function(msg) {
            self.emit("notification", {
              channel: msg.relname,
              payload: msg.extra
            });
          });
          self.emit("connect");
          self._pulseQueryQueue(true);
          cb(null, this);
        });
      });
    };
    Client2.prototype.connect = function(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(this);
          }
        });
      });
    };
    Client2.prototype.query = function(config, values, callback) {
      let query;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config === null || config === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query = config;
        if (typeof values === "function") {
          config.callback = values;
        }
      } else {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        query = new NativeQuery(config, values, callback);
        if (!query.callback) {
          let resolveOut, rejectOut;
          result = new this._Promise((resolve, reject) => {
            resolveOut = resolve;
            rejectOut = reject;
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
          query.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
        }
      }
      if (readTimeout) {
        queryCallback = query.callback || (() => {
        });
        readTimeoutTimer = setTimeout(() => {
          const error = new Error("Query read timeout");
          process.nextTick(() => {
            query.handleError(error, this.connection);
          });
          queryCallback(error);
          query.callback = () => {
          };
          const index = this._queryQueue.indexOf(query);
          if (index > -1) {
            this._queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (!this._queryable) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client has encountered a connection error and is not queryable"));
        });
        return result;
      }
      if (this._ending) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client was closed and is not queryable"));
        });
        return result;
      }
      if (this._queryQueue.length > 0) {
        queryQueueLengthDeprecationNotice();
      }
      this._queryQueue.push(query);
      this._pulseQueryQueue();
      return result;
    };
    Client2.prototype.end = function(cb) {
      const self = this;
      this._ending = true;
      if (!this._connected) {
        this.once("connect", this.end.bind(this, cb));
      }
      let result;
      if (!cb) {
        result = new this._Promise(function(resolve, reject) {
          cb = /* @__PURE__ */ __name((err) => err ? reject(err) : resolve(), "cb");
        });
      }
      this.native.end(function() {
        self._connected = false;
        self._errorAllQueries(new Error("Connection terminated"));
        process.nextTick(() => {
          self.emit("end");
          if (cb) cb();
        });
      });
      return result;
    };
    Client2.prototype._hasActiveQuery = function() {
      return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    Client2.prototype._pulseQueryQueue = function(initialConnection) {
      if (!this._connected) {
        return;
      }
      if (this._hasActiveQuery()) {
        return;
      }
      const query = this._queryQueue.shift();
      if (!query) {
        if (!initialConnection) {
          this.emit("drain");
        }
        return;
      }
      this._activeQuery = query;
      query.submit(this);
      const self = this;
      query.once("_done", function() {
        self._pulseQueryQueue();
      });
    };
    Client2.prototype.cancel = function(query) {
      if (this._activeQuery === query) {
        this.native.cancel(function() {
        });
      } else if (this._queryQueue.indexOf(query) !== -1) {
        this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
      }
    };
    Client2.prototype.ref = function() {
    };
    Client2.prototype.unref = function() {
    };
    Client2.prototype.setTypeParser = function(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    };
    Client2.prototype.getTypeParser = function(oid, format) {
      return this._types.getTypeParser(oid, format);
    };
    Client2.prototype.isConnected = function() {
      return this._connected;
    };
  }
});

// node_modules/pg/lib/native/index.js
var require_native = __commonJS({
  "node_modules/pg/lib/native/index.js"(exports, module) {
    "use strict";
    init_esm();
    module.exports = require_client2();
  }
});

// node_modules/pg/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/pg/lib/index.js"(exports, module) {
    "use strict";
    init_esm();
    var Client2 = require_client();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var Result2 = require_result();
    var utils = require_utils();
    var Pool2 = require_pg_pool();
    var TypeOverrides2 = require_type_overrides();
    var { DatabaseError: DatabaseError2 } = require_dist();
    var { escapeIdentifier: escapeIdentifier2, escapeLiteral: escapeLiteral2 } = require_utils();
    var poolFactory = /* @__PURE__ */ __name((Client3) => {
      return class BoundPool extends Pool2 {
        static {
          __name(this, "BoundPool");
        }
        constructor(options) {
          super(options, Client3);
        }
      };
    }, "poolFactory");
    var PG = /* @__PURE__ */ __name(function(clientConstructor2) {
      this.defaults = defaults2;
      this.Client = clientConstructor2;
      this.Query = this.Client.Query;
      this.Pool = poolFactory(this.Client);
      this._pools = [];
      this.Connection = Connection2;
      this.types = require_pg_types();
      this.DatabaseError = DatabaseError2;
      this.TypeOverrides = TypeOverrides2;
      this.escapeIdentifier = escapeIdentifier2;
      this.escapeLiteral = escapeLiteral2;
      this.Result = Result2;
      this.utils = utils;
    }, "PG");
    var clientConstructor = Client2;
    var forceNative = false;
    try {
      forceNative = !!process.env.NODE_PG_FORCE_NATIVE;
    } catch {
    }
    if (forceNative) {
      clientConstructor = require_native();
    }
    module.exports = new PG(clientConstructor);
    Object.defineProperty(module.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        let native = null;
        try {
          native = new PG(require_native());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// node_modules/@prisma/adapter-pg/node_modules/postgres-array/index.js
var require_postgres_array2 = __commonJS({
  "node_modules/@prisma/adapter-pg/node_modules/postgres-array/index.js"(exports) {
    "use strict";
    init_esm();
    var BACKSLASH = "\\";
    var DQUOT = '"';
    var LBRACE = "{";
    var RBRACE = "}";
    var LBRACKET = "[";
    var EQUALS = "=";
    var COMMA = ",";
    var NULL_STRING = "NULL";
    function makeParseArrayWithTransform(transform) {
      const haveTransform = transform != null;
      return /* @__PURE__ */ __name(function parseArray3(str) {
        const rbraceIndex = str.length - 1;
        if (rbraceIndex === 1) {
          return [];
        }
        if (str[rbraceIndex] !== RBRACE) {
          throw new Error("Invalid array text - must end with }");
        }
        let position = 0;
        if (str[position] === LBRACKET) {
          position = str.indexOf(EQUALS) + 1;
        }
        if (str[position++] !== LBRACE) {
          throw new Error("Invalid array text - must start with {");
        }
        const output = [];
        let current = output;
        const stack = [];
        let currentStringStart = position;
        let currentString = "";
        let expectValue = true;
        for (; position < rbraceIndex; ++position) {
          let char = str[position];
          if (char === DQUOT) {
            currentStringStart = ++position;
            let dquot = str.indexOf(DQUOT, currentStringStart);
            let backSlash = str.indexOf(BACKSLASH, currentStringStart);
            while (backSlash !== -1 && backSlash < dquot) {
              position = backSlash;
              const part2 = str.slice(currentStringStart, position);
              currentString += part2;
              currentStringStart = ++position;
              if (dquot === position++) {
                dquot = str.indexOf(DQUOT, position);
              }
              backSlash = str.indexOf(BACKSLASH, position);
            }
            position = dquot;
            const part = str.slice(currentStringStart, position);
            currentString += part;
            current.push(haveTransform ? transform(currentString) : currentString);
            currentString = "";
            expectValue = false;
          } else if (char === LBRACE) {
            const newArray = [];
            current.push(newArray);
            stack.push(current);
            current = newArray;
            currentStringStart = position + 1;
            expectValue = true;
          } else if (char === COMMA) {
            expectValue = true;
          } else if (char === RBRACE) {
            expectValue = false;
            const arr = stack.pop();
            if (arr === void 0) {
              throw new Error("Invalid array text - too many '}'");
            }
            current = arr;
          } else if (expectValue) {
            currentStringStart = position;
            while ((char = str[position]) !== COMMA && char !== RBRACE && position < rbraceIndex) {
              ++position;
            }
            const part = str.slice(currentStringStart, position--);
            current.push(
              part === NULL_STRING ? null : haveTransform ? transform(part) : part
            );
            expectValue = false;
          } else {
            throw new Error("Was expecting delimeter");
          }
        }
        return output;
      }, "parseArray");
    }
    __name(makeParseArrayWithTransform, "makeParseArrayWithTransform");
    var parseArray2 = makeParseArrayWithTransform();
    exports.parse = (source, transform) => transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray2(source);
  }
});

// node_modules/@prisma/client/runtime/library.js
var require_library = __commonJS({
  "node_modules/@prisma/client/runtime/library.js"(exports, module) {
    "use strict";
    init_esm();
    var yu = Object.create;
    var jt = Object.defineProperty;
    var bu = Object.getOwnPropertyDescriptor;
    var Eu = Object.getOwnPropertyNames;
    var wu = Object.getPrototypeOf;
    var xu = Object.prototype.hasOwnProperty;
    var Do = /* @__PURE__ */ __name((e, r) => () => (e && (r = e(e = 0)), r), "Do");
    var ue = /* @__PURE__ */ __name((e, r) => () => (r || e((r = { exports: {} }).exports, r), r.exports), "ue");
    var tr = /* @__PURE__ */ __name((e, r) => {
      for (var t in r) jt(e, t, { get: r[t], enumerable: true });
    }, "tr");
    var Oo = /* @__PURE__ */ __name((e, r, t, n) => {
      if (r && typeof r == "object" || typeof r == "function") for (let i of Eu(r)) !xu.call(e, i) && i !== t && jt(e, i, { get: /* @__PURE__ */ __name(() => r[i], "get"), enumerable: !(n = bu(r, i)) || n.enumerable });
      return e;
    }, "Oo");
    var O = /* @__PURE__ */ __name((e, r, t) => (t = e != null ? yu(wu(e)) : {}, Oo(r || !e || !e.__esModule ? jt(t, "default", { value: e, enumerable: true }) : t, e)), "O");
    var vu = /* @__PURE__ */ __name((e) => Oo(jt({}, "__esModule", { value: true }), e), "vu");
    var hi = ue((_g, is) => {
      "use strict";
      is.exports = (e, r = process.argv) => {
        let t = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = r.indexOf(t + e), i = r.indexOf("--");
        return n !== -1 && (i === -1 || n < i);
      };
    });
    var as = ue((Ng, ss) => {
      "use strict";
      var Fc = __require("node:os"), os = __require("node:tty"), de = hi(), { env: G } = process, Qe;
      de("no-color") || de("no-colors") || de("color=false") || de("color=never") ? Qe = 0 : (de("color") || de("colors") || de("color=true") || de("color=always")) && (Qe = 1);
      "FORCE_COLOR" in G && (G.FORCE_COLOR === "true" ? Qe = 1 : G.FORCE_COLOR === "false" ? Qe = 0 : Qe = G.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(G.FORCE_COLOR, 10), 3));
      function yi(e) {
        return e === 0 ? false : { level: e, hasBasic: true, has256: e >= 2, has16m: e >= 3 };
      }
      __name(yi, "yi");
      function bi(e, r) {
        if (Qe === 0) return 0;
        if (de("color=16m") || de("color=full") || de("color=truecolor")) return 3;
        if (de("color=256")) return 2;
        if (e && !r && Qe === void 0) return 0;
        let t = Qe || 0;
        if (G.TERM === "dumb") return t;
        if (process.platform === "win32") {
          let n = Fc.release().split(".");
          return Number(n[0]) >= 10 && Number(n[2]) >= 10586 ? Number(n[2]) >= 14931 ? 3 : 2 : 1;
        }
        if ("CI" in G) return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((n) => n in G) || G.CI_NAME === "codeship" ? 1 : t;
        if ("TEAMCITY_VERSION" in G) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(G.TEAMCITY_VERSION) ? 1 : 0;
        if (G.COLORTERM === "truecolor") return 3;
        if ("TERM_PROGRAM" in G) {
          let n = parseInt((G.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
          switch (G.TERM_PROGRAM) {
            case "iTerm.app":
              return n >= 3 ? 3 : 2;
            case "Apple_Terminal":
              return 2;
          }
        }
        return /-256(color)?$/i.test(G.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(G.TERM) || "COLORTERM" in G ? 1 : t;
      }
      __name(bi, "bi");
      function Mc(e) {
        let r = bi(e, e && e.isTTY);
        return yi(r);
      }
      __name(Mc, "Mc");
      ss.exports = { supportsColor: Mc, stdout: yi(bi(true, os.isatty(1))), stderr: yi(bi(true, os.isatty(2))) };
    });
    var cs = ue((Lg, us) => {
      "use strict";
      var $c = as(), br = hi();
      function ls(e) {
        if (/^\d{3,4}$/.test(e)) {
          let t = /(\d{1,2})(\d{2})/.exec(e) || [];
          return { major: 0, minor: parseInt(t[1], 10), patch: parseInt(t[2], 10) };
        }
        let r = (e || "").split(".").map((t) => parseInt(t, 10));
        return { major: r[0], minor: r[1], patch: r[2] };
      }
      __name(ls, "ls");
      function Ei(e) {
        let { CI: r, FORCE_HYPERLINK: t, NETLIFY: n, TEAMCITY_VERSION: i, TERM_PROGRAM: o, TERM_PROGRAM_VERSION: s, VTE_VERSION: a, TERM: l } = process.env;
        if (t) return !(t.length > 0 && parseInt(t, 10) === 0);
        if (br("no-hyperlink") || br("no-hyperlinks") || br("hyperlink=false") || br("hyperlink=never")) return false;
        if (br("hyperlink=true") || br("hyperlink=always") || n) return true;
        if (!$c.supportsColor(e) || e && !e.isTTY) return false;
        if ("WT_SESSION" in process.env) return true;
        if (process.platform === "win32" || r || i) return false;
        if (o) {
          let u = ls(s || "");
          switch (o) {
            case "iTerm.app":
              return u.major === 3 ? u.minor >= 1 : u.major > 3;
            case "WezTerm":
              return u.major >= 20200620;
            case "vscode":
              return u.major > 1 || u.major === 1 && u.minor >= 72;
            case "ghostty":
              return true;
          }
        }
        if (a) {
          if (a === "0.50.0") return false;
          let u = ls(a);
          return u.major > 0 || u.minor >= 50;
        }
        switch (l) {
          case "alacritty":
            return true;
        }
        return false;
      }
      __name(Ei, "Ei");
      us.exports = { supportsHyperlink: Ei, stdout: Ei(process.stdout), stderr: Ei(process.stderr) };
    });
    var ps = ue((Kg, qc) => {
      qc.exports = { name: "@prisma/internals", version: "6.19.3", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", empathic: "2.0.0", "escape-string-regexp": "5.0.0", execa: "8.0.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "global-directory": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/schema-engine-wasm": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: true } }, sideEffects: false };
    });
    var Ti = ue((gh, Qc) => {
      Qc.exports = { name: "@prisma/engines-version", version: "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "c2990dca591cba766e3b7ef5d9e8a84796e47ab7" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
    });
    var on = ue((nn) => {
      "use strict";
      Object.defineProperty(nn, "__esModule", { value: true });
      nn.enginesVersion = void 0;
      nn.enginesVersion = Ti().prisma.enginesVersion;
    });
    var hs = ue((Ih, gs) => {
      "use strict";
      gs.exports = (e) => {
        let r = e.match(/^[ \t]*(?=\S)/gm);
        return r ? r.reduce((t, n) => Math.min(t, n.length), 1 / 0) : 0;
      };
    });
    var Di = ue((kh, Es) => {
      "use strict";
      Es.exports = (e, r = 1, t) => {
        if (t = { indent: " ", includeEmptyLines: false, ...t }, typeof e != "string") throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e}\``);
        if (typeof r != "number") throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof r}\``);
        if (typeof t.indent != "string") throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof t.indent}\``);
        if (r === 0) return e;
        let n = t.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
        return e.replace(n, t.indent.repeat(r));
      };
    });
    var vs = ue((jh, tp) => {
      tp.exports = { name: "dotenv", version: "16.5.0", description: "Loads environment variables from .env file", main: "lib/main.js", types: "lib/main.d.ts", exports: { ".": { types: "./lib/main.d.ts", require: "./lib/main.js", default: "./lib/main.js" }, "./config": "./config.js", "./config.js": "./config.js", "./lib/env-options": "./lib/env-options.js", "./lib/env-options.js": "./lib/env-options.js", "./lib/cli-options": "./lib/cli-options.js", "./lib/cli-options.js": "./lib/cli-options.js", "./package.json": "./package.json" }, scripts: { "dts-check": "tsc --project tests/types/tsconfig.json", lint: "standard", pretest: "npm run lint && npm run dts-check", test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000", "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov", prerelease: "npm test", release: "standard-version" }, repository: { type: "git", url: "git://github.com/motdotla/dotenv.git" }, homepage: "https://github.com/motdotla/dotenv#readme", funding: "https://dotenvx.com", keywords: ["dotenv", "env", ".env", "environment", "variables", "config", "settings"], readmeFilename: "README.md", license: "BSD-2-Clause", devDependencies: { "@types/node": "^18.11.3", decache: "^4.6.2", sinon: "^14.0.1", standard: "^17.0.0", "standard-version": "^9.5.0", tap: "^19.2.0", typescript: "^4.8.4" }, engines: { node: ">=12" }, browser: { fs: false } };
    });
    var As = ue((Bh, _e) => {
      "use strict";
      var Fi = __require("node:fs"), Mi = __require("node:path"), np = __require("node:os"), ip = __require("node:crypto"), op = vs(), Ts = op.version, sp = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
      function ap(e) {
        let r = {}, t = e.toString();
        t = t.replace(/\r\n?/mg, `
`);
        let n;
        for (; (n = sp.exec(t)) != null; ) {
          let i = n[1], o = n[2] || "";
          o = o.trim();
          let s = o[0];
          o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), r[i] = o;
        }
        return r;
      }
      __name(ap, "ap");
      function lp(e) {
        let r = Rs(e), t = B.configDotenv({ path: r });
        if (!t.parsed) {
          let s = new Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);
          throw s.code = "MISSING_DATA", s;
        }
        let n = Ss(e).split(","), i = n.length, o;
        for (let s = 0; s < i; s++) try {
          let a = n[s].trim(), l = cp(t, a);
          o = B.decrypt(l.ciphertext, l.key);
          break;
        } catch (a) {
          if (s + 1 >= i) throw a;
        }
        return B.parse(o);
      }
      __name(lp, "lp");
      function up(e) {
        console.log(`[dotenv@${Ts}][WARN] ${e}`);
      }
      __name(up, "up");
      function ot(e) {
        console.log(`[dotenv@${Ts}][DEBUG] ${e}`);
      }
      __name(ot, "ot");
      function Ss(e) {
        return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
      }
      __name(Ss, "Ss");
      function cp(e, r) {
        let t;
        try {
          t = new URL(r);
        } catch (a) {
          if (a.code === "ERR_INVALID_URL") {
            let l = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
            throw l.code = "INVALID_DOTENV_KEY", l;
          }
          throw a;
        }
        let n = t.password;
        if (!n) {
          let a = new Error("INVALID_DOTENV_KEY: Missing key part");
          throw a.code = "INVALID_DOTENV_KEY", a;
        }
        let i = t.searchParams.get("environment");
        if (!i) {
          let a = new Error("INVALID_DOTENV_KEY: Missing environment part");
          throw a.code = "INVALID_DOTENV_KEY", a;
        }
        let o = `DOTENV_VAULT_${i.toUpperCase()}`, s = e.parsed[o];
        if (!s) {
          let a = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
          throw a.code = "NOT_FOUND_DOTENV_ENVIRONMENT", a;
        }
        return { ciphertext: s, key: n };
      }
      __name(cp, "cp");
      function Rs(e) {
        let r = null;
        if (e && e.path && e.path.length > 0) if (Array.isArray(e.path)) for (let t of e.path) Fi.existsSync(t) && (r = t.endsWith(".vault") ? t : `${t}.vault`);
        else r = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
        else r = Mi.resolve(process.cwd(), ".env.vault");
        return Fi.existsSync(r) ? r : null;
      }
      __name(Rs, "Rs");
      function Ps(e) {
        return e[0] === "~" ? Mi.join(np.homedir(), e.slice(1)) : e;
      }
      __name(Ps, "Ps");
      function pp(e) {
        !!(e && e.debug) && ot("Loading env from encrypted .env.vault");
        let t = B._parseVault(e), n = process.env;
        return e && e.processEnv != null && (n = e.processEnv), B.populate(n, t, e), { parsed: t };
      }
      __name(pp, "pp");
      function dp(e) {
        let r = Mi.resolve(process.cwd(), ".env"), t = "utf8", n = !!(e && e.debug);
        e && e.encoding ? t = e.encoding : n && ot("No encoding is specified. UTF-8 is used by default");
        let i = [r];
        if (e && e.path) if (!Array.isArray(e.path)) i = [Ps(e.path)];
        else {
          i = [];
          for (let l of e.path) i.push(Ps(l));
        }
        let o, s = {};
        for (let l of i) try {
          let u = B.parse(Fi.readFileSync(l, { encoding: t }));
          B.populate(s, u, e);
        } catch (u) {
          n && ot(`Failed to load ${l} ${u.message}`), o = u;
        }
        let a = process.env;
        return e && e.processEnv != null && (a = e.processEnv), B.populate(a, s, e), o ? { parsed: s, error: o } : { parsed: s };
      }
      __name(dp, "dp");
      function mp(e) {
        if (Ss(e).length === 0) return B.configDotenv(e);
        let r = Rs(e);
        return r ? B._configVault(e) : (up(`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`), B.configDotenv(e));
      }
      __name(mp, "mp");
      function fp(e, r) {
        let t = Buffer.from(r.slice(-64), "hex"), n = Buffer.from(e, "base64"), i = n.subarray(0, 12), o = n.subarray(-16);
        n = n.subarray(12, -16);
        try {
          let s = ip.createDecipheriv("aes-256-gcm", t, i);
          return s.setAuthTag(o), `${s.update(n)}${s.final()}`;
        } catch (s) {
          let a = s instanceof RangeError, l = s.message === "Invalid key length", u = s.message === "Unsupported state or unable to authenticate data";
          if (a || l) {
            let c = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
            throw c.code = "INVALID_DOTENV_KEY", c;
          } else if (u) {
            let c = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
            throw c.code = "DECRYPTION_FAILED", c;
          } else throw s;
        }
      }
      __name(fp, "fp");
      function gp(e, r, t = {}) {
        let n = !!(t && t.debug), i = !!(t && t.override);
        if (typeof r != "object") {
          let o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
          throw o.code = "OBJECT_REQUIRED", o;
        }
        for (let o of Object.keys(r)) Object.prototype.hasOwnProperty.call(e, o) ? (i === true && (e[o] = r[o]), n && ot(i === true ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : e[o] = r[o];
      }
      __name(gp, "gp");
      var B = { configDotenv: dp, _configVault: pp, _parseVault: lp, config: mp, decrypt: fp, parse: ap, populate: gp };
      _e.exports.configDotenv = B.configDotenv;
      _e.exports._configVault = B._configVault;
      _e.exports._parseVault = B._parseVault;
      _e.exports.config = B.config;
      _e.exports.decrypt = B.decrypt;
      _e.exports.parse = B.parse;
      _e.exports.populate = B.populate;
      _e.exports = B;
    });
    var Os = ue((Kh, cn) => {
      "use strict";
      cn.exports = (e = {}) => {
        let r;
        if (e.repoUrl) r = e.repoUrl;
        else if (e.user && e.repo) r = `https://github.com/${e.user}/${e.repo}`;
        else throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
        let t = new URL(`${r}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
        for (let i of n) {
          let o = e[i];
          if (o !== void 0) {
            if (i === "labels" || i === "projects") {
              if (!Array.isArray(o)) throw new TypeError(`The \`${i}\` option should be an array`);
              o = o.join(",");
            }
            t.searchParams.set(i, o);
          }
        }
        return t.toString();
      };
      cn.exports.default = cn.exports;
    });
    var Ki = ue((vb, ea) => {
      "use strict";
      ea.exports = /* @__PURE__ */ function() {
        function e(r, t, n, i, o) {
          return r < t || n < t ? r > n ? n + 1 : r + 1 : i === o ? t : t + 1;
        }
        __name(e, "e");
        return function(r, t) {
          if (r === t) return 0;
          if (r.length > t.length) {
            var n = r;
            r = t, t = n;
          }
          for (var i = r.length, o = t.length; i > 0 && r.charCodeAt(i - 1) === t.charCodeAt(o - 1); ) i--, o--;
          for (var s = 0; s < i && r.charCodeAt(s) === t.charCodeAt(s); ) s++;
          if (i -= s, o -= s, i === 0 || o < 3) return o;
          var a = 0, l, u, c, p, d, f, h, g, I, T, S, b, D = [];
          for (l = 0; l < i; l++) D.push(l + 1), D.push(r.charCodeAt(s + l));
          for (var me = D.length - 1; a < o - 3; ) for (I = t.charCodeAt(s + (u = a)), T = t.charCodeAt(s + (c = a + 1)), S = t.charCodeAt(s + (p = a + 2)), b = t.charCodeAt(s + (d = a + 3)), f = a += 4, l = 0; l < me; l += 2) h = D[l], g = D[l + 1], u = e(h, u, c, I, g), c = e(u, c, p, T, g), p = e(c, p, d, S, g), f = e(p, d, f, b, g), D[l] = f, d = p, p = c, c = u, u = h;
          for (; a < o; ) for (I = t.charCodeAt(s + (u = a)), f = ++a, l = 0; l < me; l += 2) h = D[l], D[l] = f = e(h, u, f, I, D[l + 1]), u = h;
          return f;
        };
      }();
    });
    var oa = Do(() => {
      "use strict";
    });
    var sa = Do(() => {
      "use strict";
    });
    var jf = {};
    tr(jf, { DMMF: /* @__PURE__ */ __name(() => ct, "DMMF"), Debug: /* @__PURE__ */ __name(() => N, "Debug"), Decimal: /* @__PURE__ */ __name(() => Fe, "Decimal"), Extensions: /* @__PURE__ */ __name(() => ni, "Extensions"), MetricsClient: /* @__PURE__ */ __name(() => Lr, "MetricsClient"), PrismaClientInitializationError: /* @__PURE__ */ __name(() => P, "PrismaClientInitializationError"), PrismaClientKnownRequestError: /* @__PURE__ */ __name(() => z, "PrismaClientKnownRequestError"), PrismaClientRustPanicError: /* @__PURE__ */ __name(() => ae, "PrismaClientRustPanicError"), PrismaClientUnknownRequestError: /* @__PURE__ */ __name(() => V, "PrismaClientUnknownRequestError"), PrismaClientValidationError: /* @__PURE__ */ __name(() => Z, "PrismaClientValidationError"), Public: /* @__PURE__ */ __name(() => ii, "Public"), Sql: /* @__PURE__ */ __name(() => ie, "Sql"), createParam: /* @__PURE__ */ __name(() => va, "createParam"), defineDmmfProperty: /* @__PURE__ */ __name(() => Ca, "defineDmmfProperty"), deserializeJsonResponse: /* @__PURE__ */ __name(() => Vr, "deserializeJsonResponse"), deserializeRawResult: /* @__PURE__ */ __name(() => Xn, "deserializeRawResult"), dmmfToRuntimeDataModel: /* @__PURE__ */ __name(() => Ns, "dmmfToRuntimeDataModel"), empty: /* @__PURE__ */ __name(() => Oa, "empty"), getPrismaClient: /* @__PURE__ */ __name(() => fu, "getPrismaClient"), getRuntime: /* @__PURE__ */ __name(() => Kn, "getRuntime"), join: /* @__PURE__ */ __name(() => Da, "join"), makeStrictEnum: /* @__PURE__ */ __name(() => gu, "makeStrictEnum"), makeTypedQueryFactory: /* @__PURE__ */ __name(() => Ia, "makeTypedQueryFactory"), objectEnumValues: /* @__PURE__ */ __name(() => On, "objectEnumValues"), raw: /* @__PURE__ */ __name(() => no, "raw"), serializeJsonQuery: /* @__PURE__ */ __name(() => $n, "serializeJsonQuery"), skip: /* @__PURE__ */ __name(() => Mn, "skip"), sqltag: /* @__PURE__ */ __name(() => io, "sqltag"), warnEnvConflicts: /* @__PURE__ */ __name(() => hu, "warnEnvConflicts"), warnOnce: /* @__PURE__ */ __name(() => at, "warnOnce") });
    module.exports = vu(jf);
    var ni = {};
    tr(ni, { defineExtension: /* @__PURE__ */ __name(() => ko, "defineExtension"), getExtensionContext: /* @__PURE__ */ __name(() => _o, "getExtensionContext") });
    function ko(e) {
      return typeof e == "function" ? e : (r) => r.$extends(e);
    }
    __name(ko, "ko");
    function _o(e) {
      return e;
    }
    __name(_o, "_o");
    var ii = {};
    tr(ii, { validator: /* @__PURE__ */ __name(() => No, "validator") });
    function No(...e) {
      return (r) => r;
    }
    __name(No, "No");
    var Bt = {};
    tr(Bt, { $: /* @__PURE__ */ __name(() => qo, "$"), bgBlack: /* @__PURE__ */ __name(() => ku, "bgBlack"), bgBlue: /* @__PURE__ */ __name(() => Fu, "bgBlue"), bgCyan: /* @__PURE__ */ __name(() => $u, "bgCyan"), bgGreen: /* @__PURE__ */ __name(() => Nu, "bgGreen"), bgMagenta: /* @__PURE__ */ __name(() => Mu, "bgMagenta"), bgRed: /* @__PURE__ */ __name(() => _u, "bgRed"), bgWhite: /* @__PURE__ */ __name(() => qu, "bgWhite"), bgYellow: /* @__PURE__ */ __name(() => Lu, "bgYellow"), black: /* @__PURE__ */ __name(() => Cu, "black"), blue: /* @__PURE__ */ __name(() => nr, "blue"), bold: /* @__PURE__ */ __name(() => W, "bold"), cyan: /* @__PURE__ */ __name(() => De, "cyan"), dim: /* @__PURE__ */ __name(() => Ce, "dim"), gray: /* @__PURE__ */ __name(() => Hr, "gray"), green: /* @__PURE__ */ __name(() => qe, "green"), grey: /* @__PURE__ */ __name(() => Ou, "grey"), hidden: /* @__PURE__ */ __name(() => Ru, "hidden"), inverse: /* @__PURE__ */ __name(() => Su, "inverse"), italic: /* @__PURE__ */ __name(() => Tu, "italic"), magenta: /* @__PURE__ */ __name(() => Iu, "magenta"), red: /* @__PURE__ */ __name(() => ce, "red"), reset: /* @__PURE__ */ __name(() => Pu, "reset"), strikethrough: /* @__PURE__ */ __name(() => Au, "strikethrough"), underline: /* @__PURE__ */ __name(() => Y, "underline"), white: /* @__PURE__ */ __name(() => Du, "white"), yellow: /* @__PURE__ */ __name(() => Ie, "yellow") });
    var oi;
    var Lo;
    var Fo;
    var Mo;
    var $o = true;
    typeof process < "u" && ({ FORCE_COLOR: oi, NODE_DISABLE_COLORS: Lo, NO_COLOR: Fo, TERM: Mo } = process.env || {}, $o = process.stdout && process.stdout.isTTY);
    var qo = { enabled: !Lo && Fo == null && Mo !== "dumb" && (oi != null && oi !== "0" || $o) };
    function F(e, r) {
      let t = new RegExp(`\\x1b\\[${r}m`, "g"), n = `\x1B[${e}m`, i = `\x1B[${r}m`;
      return function(o) {
        return !qo.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(t, i + n) : o) + i;
      };
    }
    __name(F, "F");
    var Pu = F(0, 0);
    var W = F(1, 22);
    var Ce = F(2, 22);
    var Tu = F(3, 23);
    var Y = F(4, 24);
    var Su = F(7, 27);
    var Ru = F(8, 28);
    var Au = F(9, 29);
    var Cu = F(30, 39);
    var ce = F(31, 39);
    var qe = F(32, 39);
    var Ie = F(33, 39);
    var nr = F(34, 39);
    var Iu = F(35, 39);
    var De = F(36, 39);
    var Du = F(37, 39);
    var Hr = F(90, 39);
    var Ou = F(90, 39);
    var ku = F(40, 49);
    var _u = F(41, 49);
    var Nu = F(42, 49);
    var Lu = F(43, 49);
    var Fu = F(44, 49);
    var Mu = F(45, 49);
    var $u = F(46, 49);
    var qu = F(47, 49);
    var Vu = 100;
    var Vo = ["green", "yellow", "blue", "magenta", "cyan", "red"];
    var Yr = [];
    var jo = Date.now();
    var ju = 0;
    var si = typeof process < "u" ? process.env : {};
    globalThis.DEBUG ??= si.DEBUG ?? "";
    globalThis.DEBUG_COLORS ??= si.DEBUG_COLORS ? si.DEBUG_COLORS === "true" : true;
    var zr = { enable(e) {
      typeof e == "string" && (globalThis.DEBUG = e);
    }, disable() {
      let e = globalThis.DEBUG;
      return globalThis.DEBUG = "", e;
    }, enabled(e) {
      let r = globalThis.DEBUG.split(",").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), t = r.some((i) => i === "" || i[0] === "-" ? false : e.match(RegExp(i.split("*").join(".*") + "$"))), n = r.some((i) => i === "" || i[0] !== "-" ? false : e.match(RegExp(i.slice(1).split("*").join(".*") + "$")));
      return t && !n;
    }, log: /* @__PURE__ */ __name((...e) => {
      let [r, t, ...n] = e;
      (console.warn ?? console.log)(`${r} ${t}`, ...n);
    }, "log"), formatters: {} };
    function Bu(e) {
      let r = { color: Vo[ju++ % Vo.length], enabled: zr.enabled(e), namespace: e, log: zr.log, extend: /* @__PURE__ */ __name(() => {
      }, "extend") }, t = /* @__PURE__ */ __name((...n) => {
        let { enabled: i, namespace: o, color: s, log: a } = r;
        if (n.length !== 0 && Yr.push([o, ...n]), Yr.length > Vu && Yr.shift(), zr.enabled(o) || i) {
          let l = n.map((c) => typeof c == "string" ? c : Uu(c)), u = `+${Date.now() - jo}ms`;
          jo = Date.now(), globalThis.DEBUG_COLORS ? a(Bt[s](W(o)), ...l, Bt[s](u)) : a(o, ...l, u);
        }
      }, "t");
      return new Proxy(t, { get: /* @__PURE__ */ __name((n, i) => r[i], "get"), set: /* @__PURE__ */ __name((n, i, o) => r[i] = o, "set") });
    }
    __name(Bu, "Bu");
    var N = new Proxy(Bu, { get: /* @__PURE__ */ __name((e, r) => zr[r], "get"), set: /* @__PURE__ */ __name((e, r, t) => zr[r] = t, "set") });
    function Uu(e, r = 2) {
      let t = /* @__PURE__ */ new Set();
      return JSON.stringify(e, (n, i) => {
        if (typeof i == "object" && i !== null) {
          if (t.has(i)) return "[Circular *]";
          t.add(i);
        } else if (typeof i == "bigint") return i.toString();
        return i;
      }, r);
    }
    __name(Uu, "Uu");
    function Bo(e = 7500) {
      let r = Yr.map(([t, ...n]) => `${t} ${n.map((i) => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
      return r.length < e ? r : r.slice(-e);
    }
    __name(Bo, "Bo");
    function Uo() {
      Yr.length = 0;
    }
    __name(Uo, "Uo");
    var gr = N;
    var Go = O(__require("node:fs"));
    function ai() {
      let e = process.env.PRISMA_QUERY_ENGINE_LIBRARY;
      if (!(e && Go.default.existsSync(e)) && process.arch === "ia32") throw new Error('The default query engine type (Node-API, "library") is currently not supported for 32bit Node. Please set `engineType = "binary"` in the "generator" block of your "schema.prisma" file (or use the environment variables "PRISMA_CLIENT_ENGINE_TYPE=binary" and/or "PRISMA_CLI_QUERY_ENGINE_TYPE=binary".)');
    }
    __name(ai, "ai");
    var li = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
    var Ut = "libquery_engine";
    function Gt(e, r) {
      let t = r === "url";
      return e.includes("windows") ? t ? "query_engine.dll.node" : `query_engine-${e}.dll.node` : e.includes("darwin") ? t ? `${Ut}.dylib.node` : `${Ut}-${e}.dylib.node` : t ? `${Ut}.so.node` : `${Ut}-${e}.so.node`;
    }
    __name(Gt, "Gt");
    var Ko = O(__require("node:child_process"));
    var mi = O(__require("node:fs/promises"));
    var Ht = O(__require("node:os"));
    var Oe = Symbol.for("@ts-pattern/matcher");
    var Gu = Symbol.for("@ts-pattern/isVariadic");
    var Wt = "@ts-pattern/anonymous-select-key";
    var ui = /* @__PURE__ */ __name((e) => !!(e && typeof e == "object"), "ui");
    var Qt = /* @__PURE__ */ __name((e) => e && !!e[Oe], "Qt");
    var Ee = /* @__PURE__ */ __name((e, r, t) => {
      if (Qt(e)) {
        let n = e[Oe](), { matched: i, selections: o } = n.match(r);
        return i && o && Object.keys(o).forEach((s) => t(s, o[s])), i;
      }
      if (ui(e)) {
        if (!ui(r)) return false;
        if (Array.isArray(e)) {
          if (!Array.isArray(r)) return false;
          let n = [], i = [], o = [];
          for (let s of e.keys()) {
            let a = e[s];
            Qt(a) && a[Gu] ? o.push(a) : o.length ? i.push(a) : n.push(a);
          }
          if (o.length) {
            if (o.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
            if (r.length < n.length + i.length) return false;
            let s = r.slice(0, n.length), a = i.length === 0 ? [] : r.slice(-i.length), l = r.slice(n.length, i.length === 0 ? 1 / 0 : -i.length);
            return n.every((u, c) => Ee(u, s[c], t)) && i.every((u, c) => Ee(u, a[c], t)) && (o.length === 0 || Ee(o[0], l, t));
          }
          return e.length === r.length && e.every((s, a) => Ee(s, r[a], t));
        }
        return Reflect.ownKeys(e).every((n) => {
          let i = e[n];
          return (n in r || Qt(o = i) && o[Oe]().matcherType === "optional") && Ee(i, r[n], t);
          var o;
        });
      }
      return Object.is(r, e);
    }, "Ee");
    var Ge = /* @__PURE__ */ __name((e) => {
      var r, t, n;
      return ui(e) ? Qt(e) ? (r = (t = (n = e[Oe]()).getSelectionKeys) == null ? void 0 : t.call(n)) != null ? r : [] : Array.isArray(e) ? Zr(e, Ge) : Zr(Object.values(e), Ge) : [];
    }, "Ge");
    var Zr = /* @__PURE__ */ __name((e, r) => e.reduce((t, n) => t.concat(r(n)), []), "Zr");
    function pe(e) {
      return Object.assign(e, { optional: /* @__PURE__ */ __name(() => Qu(e), "optional"), and: /* @__PURE__ */ __name((r) => q(e, r), "and"), or: /* @__PURE__ */ __name((r) => Wu(e, r), "or"), select: /* @__PURE__ */ __name((r) => r === void 0 ? Qo(e) : Qo(r, e), "select") });
    }
    __name(pe, "pe");
    function Qu(e) {
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
        let t = {}, n = /* @__PURE__ */ __name((i, o) => {
          t[i] = o;
        }, "n");
        return r === void 0 ? (Ge(e).forEach((i) => n(i, void 0)), { matched: true, selections: t }) : { matched: Ee(e, r, n), selections: t };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Ge(e), "getSelectionKeys"), matcherType: "optional" }) });
    }
    __name(Qu, "Qu");
    function q(...e) {
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
        let t = {}, n = /* @__PURE__ */ __name((i, o) => {
          t[i] = o;
        }, "n");
        return { matched: e.every((i) => Ee(i, r, n)), selections: t };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Zr(e, Ge), "getSelectionKeys"), matcherType: "and" }) });
    }
    __name(q, "q");
    function Wu(...e) {
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
        let t = {}, n = /* @__PURE__ */ __name((i, o) => {
          t[i] = o;
        }, "n");
        return Zr(e, Ge).forEach((i) => n(i, void 0)), { matched: e.some((i) => Ee(i, r, n)), selections: t };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Zr(e, Ge), "getSelectionKeys"), matcherType: "or" }) });
    }
    __name(Wu, "Wu");
    function A(e) {
      return { [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => ({ matched: !!e(r) }), "match") }) };
    }
    __name(A, "A");
    function Qo(...e) {
      let r = typeof e[0] == "string" ? e[0] : void 0, t = e.length === 2 ? e[1] : typeof e[0] == "string" ? void 0 : e[0];
      return pe({ [Oe]: () => ({ match: /* @__PURE__ */ __name((n) => {
        let i = { [r ?? Wt]: n };
        return { matched: t === void 0 || Ee(t, n, (o, s) => {
          i[o] = s;
        }), selections: i };
      }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => [r ?? Wt].concat(t === void 0 ? [] : Ge(t)), "getSelectionKeys") }) });
    }
    __name(Qo, "Qo");
    function ye(e) {
      return typeof e == "number";
    }
    __name(ye, "ye");
    function Ve(e) {
      return typeof e == "string";
    }
    __name(Ve, "Ve");
    function je(e) {
      return typeof e == "bigint";
    }
    __name(je, "je");
    var eg = pe(A(function(e) {
      return true;
    }));
    var Be = /* @__PURE__ */ __name((e) => Object.assign(pe(e), { startsWith: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && n.startsWith(t)))));
      var t;
    }, "startsWith"), endsWith: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && n.endsWith(t)))));
      var t;
    }, "endsWith"), minLength: /* @__PURE__ */ __name((r) => Be(q(e, ((t) => A((n) => Ve(n) && n.length >= t))(r))), "minLength"), length: /* @__PURE__ */ __name((r) => Be(q(e, ((t) => A((n) => Ve(n) && n.length === t))(r))), "length"), maxLength: /* @__PURE__ */ __name((r) => Be(q(e, ((t) => A((n) => Ve(n) && n.length <= t))(r))), "maxLength"), includes: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && n.includes(t)))));
      var t;
    }, "includes"), regex: /* @__PURE__ */ __name((r) => {
      return Be(q(e, (t = r, A((n) => Ve(n) && !!n.match(t)))));
      var t;
    }, "regex") }), "Be");
    var rg = Be(A(Ve));
    var be = /* @__PURE__ */ __name((e) => Object.assign(pe(e), { between: /* @__PURE__ */ __name((r, t) => be(q(e, ((n, i) => A((o) => ye(o) && n <= o && i >= o))(r, t))), "between"), lt: /* @__PURE__ */ __name((r) => be(q(e, ((t) => A((n) => ye(n) && n < t))(r))), "lt"), gt: /* @__PURE__ */ __name((r) => be(q(e, ((t) => A((n) => ye(n) && n > t))(r))), "gt"), lte: /* @__PURE__ */ __name((r) => be(q(e, ((t) => A((n) => ye(n) && n <= t))(r))), "lte"), gte: /* @__PURE__ */ __name((r) => be(q(e, ((t) => A((n) => ye(n) && n >= t))(r))), "gte"), int: /* @__PURE__ */ __name(() => be(q(e, A((r) => ye(r) && Number.isInteger(r)))), "int"), finite: /* @__PURE__ */ __name(() => be(q(e, A((r) => ye(r) && Number.isFinite(r)))), "finite"), positive: /* @__PURE__ */ __name(() => be(q(e, A((r) => ye(r) && r > 0))), "positive"), negative: /* @__PURE__ */ __name(() => be(q(e, A((r) => ye(r) && r < 0))), "negative") }), "be");
    var tg = be(A(ye));
    var Ue = /* @__PURE__ */ __name((e) => Object.assign(pe(e), { between: /* @__PURE__ */ __name((r, t) => Ue(q(e, ((n, i) => A((o) => je(o) && n <= o && i >= o))(r, t))), "between"), lt: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n < t))(r))), "lt"), gt: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n > t))(r))), "gt"), lte: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n <= t))(r))), "lte"), gte: /* @__PURE__ */ __name((r) => Ue(q(e, ((t) => A((n) => je(n) && n >= t))(r))), "gte"), positive: /* @__PURE__ */ __name(() => Ue(q(e, A((r) => je(r) && r > 0))), "positive"), negative: /* @__PURE__ */ __name(() => Ue(q(e, A((r) => je(r) && r < 0))), "negative") }), "Ue");
    var ng = Ue(A(je));
    var ig = pe(A(function(e) {
      return typeof e == "boolean";
    }));
    var og = pe(A(function(e) {
      return typeof e == "symbol";
    }));
    var sg = pe(A(function(e) {
      return e == null;
    }));
    var ag = pe(A(function(e) {
      return e != null;
    }));
    var ci = class extends Error {
      static {
        __name(this, "ci");
      }
      constructor(r) {
        let t;
        try {
          t = JSON.stringify(r);
        } catch {
          t = r;
        }
        super(`Pattern matching error: no pattern matches value ${t}`), this.input = void 0, this.input = r;
      }
    };
    var pi = { matched: false, value: void 0 };
    function hr(e) {
      return new di(e, pi);
    }
    __name(hr, "hr");
    var di = class e {
      static {
        __name(this, "e");
      }
      constructor(r, t) {
        this.input = void 0, this.state = void 0, this.input = r, this.state = t;
      }
      with(...r) {
        if (this.state.matched) return this;
        let t = r[r.length - 1], n = [r[0]], i;
        r.length === 3 && typeof r[1] == "function" ? i = r[1] : r.length > 2 && n.push(...r.slice(1, r.length - 1));
        let o = false, s = {}, a = /* @__PURE__ */ __name((u, c) => {
          o = true, s[u] = c;
        }, "a"), l = !n.some((u) => Ee(u, this.input, a)) || i && !i(this.input) ? pi : { matched: true, value: t(o ? Wt in s ? s[Wt] : s : this.input, this.input) };
        return new e(this.input, l);
      }
      when(r, t) {
        if (this.state.matched) return this;
        let n = !!r(this.input);
        return new e(this.input, n ? { matched: true, value: t(this.input, this.input) } : pi);
      }
      otherwise(r) {
        return this.state.matched ? this.state.value : r(this.input);
      }
      exhaustive() {
        if (this.state.matched) return this.state.value;
        throw new ci(this.input);
      }
      run() {
        return this.exhaustive();
      }
      returnType() {
        return this;
      }
    };
    var Ho = __require("node:util");
    var Ju = { warn: Ie("prisma:warn") };
    var Ku = { warn: /* @__PURE__ */ __name(() => !process.env.PRISMA_DISABLE_WARNINGS, "warn") };
    function Jt(e, ...r) {
      Ku.warn() && console.warn(`${Ju.warn} ${e}`, ...r);
    }
    __name(Jt, "Jt");
    var Hu = (0, Ho.promisify)(Ko.default.exec);
    var ee = gr("prisma:get-platform");
    var Yu = ["1.0.x", "1.1.x", "3.0.x"];
    async function Yo() {
      let e = Ht.default.platform(), r = process.arch;
      if (e === "freebsd") {
        let s = await Yt("freebsd-version");
        if (s && s.trim().length > 0) {
          let l = /^(\d+)\.?/.exec(s);
          if (l) return { platform: "freebsd", targetDistro: `freebsd${l[1]}`, arch: r };
        }
      }
      if (e !== "linux") return { platform: e, arch: r };
      let t = await Zu(), n = await sc(), i = ec({ arch: r, archFromUname: n, familyDistro: t.familyDistro }), { libssl: o } = await rc(i);
      return { platform: "linux", libssl: o, arch: r, archFromUname: n, ...t };
    }
    __name(Yo, "Yo");
    function zu(e) {
      let r = /^ID="?([^"\n]*)"?$/im, t = /^ID_LIKE="?([^"\n]*)"?$/im, n = r.exec(e), i = n && n[1] && n[1].toLowerCase() || "", o = t.exec(e), s = o && o[1] && o[1].toLowerCase() || "", a = hr({ id: i, idLike: s }).with({ id: "alpine" }, ({ id: l }) => ({ targetDistro: "musl", familyDistro: l, originalDistro: l })).with({ id: "raspbian" }, ({ id: l }) => ({ targetDistro: "arm", familyDistro: "debian", originalDistro: l })).with({ id: "nixos" }, ({ id: l }) => ({ targetDistro: "nixos", originalDistro: l, familyDistro: "nixos" })).with({ id: "debian" }, { id: "ubuntu" }, ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).with({ id: "rhel" }, { id: "centos" }, { id: "fedora" }, ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).when(({ idLike: l }) => l.includes("debian") || l.includes("ubuntu"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).when(({ idLike: l }) => i === "arch" || l.includes("arch"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "arch", originalDistro: l })).when(({ idLike: l }) => l.includes("centos") || l.includes("fedora") || l.includes("rhel") || l.includes("suse"), ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).otherwise(({ id: l }) => ({ targetDistro: void 0, familyDistro: void 0, originalDistro: l }));
      return ee(`Found distro info:
${JSON.stringify(a, null, 2)}`), a;
    }
    __name(zu, "zu");
    async function Zu() {
      let e = "/etc/os-release";
      try {
        let r = await mi.default.readFile(e, { encoding: "utf-8" });
        return zu(r);
      } catch {
        return { targetDistro: void 0, familyDistro: void 0, originalDistro: void 0 };
      }
    }
    __name(Zu, "Zu");
    function Xu(e) {
      let r = /^OpenSSL\s(\d+\.\d+)\.\d+/.exec(e);
      if (r) {
        let t = `${r[1]}.x`;
        return zo(t);
      }
    }
    __name(Xu, "Xu");
    function Wo(e) {
      let r = /libssl\.so\.(\d)(\.\d)?/.exec(e);
      if (r) {
        let t = `${r[1]}${r[2] ?? ".0"}.x`;
        return zo(t);
      }
    }
    __name(Wo, "Wo");
    function zo(e) {
      let r = (() => {
        if (Xo(e)) return e;
        let t = e.split(".");
        return t[1] = "0", t.join(".");
      })();
      if (Yu.includes(r)) return r;
    }
    __name(zo, "zo");
    function ec(e) {
      return hr(e).with({ familyDistro: "musl" }, () => (ee('Trying platform-specific paths for "alpine"'), ["/lib", "/usr/lib"])).with({ familyDistro: "debian" }, ({ archFromUname: r }) => (ee('Trying platform-specific paths for "debian" (and "ubuntu")'), [`/usr/lib/${r}-linux-gnu`, `/lib/${r}-linux-gnu`])).with({ familyDistro: "rhel" }, () => (ee('Trying platform-specific paths for "rhel"'), ["/lib64", "/usr/lib64"])).otherwise(({ familyDistro: r, arch: t, archFromUname: n }) => (ee(`Don't know any platform-specific paths for "${r}" on ${t} (${n})`), []));
    }
    __name(ec, "ec");
    async function rc(e) {
      let r = 'grep -v "libssl.so.0"', t = await Jo(e);
      if (t) {
        ee(`Found libssl.so file using platform-specific paths: ${t}`);
        let o = Wo(t);
        if (ee(`The parsed libssl version is: ${o}`), o) return { libssl: o, strategy: "libssl-specific-path" };
      }
      ee('Falling back to "ldconfig" and other generic paths');
      let n = await Yt(`ldconfig -p | sed "s/.*=>s*//" | sed "s|.*/||" | grep libssl | sort | ${r}`);
      if (n || (n = await Jo(["/lib64", "/usr/lib64", "/lib", "/usr/lib"])), n) {
        ee(`Found libssl.so file using "ldconfig" or other generic paths: ${n}`);
        let o = Wo(n);
        if (ee(`The parsed libssl version is: ${o}`), o) return { libssl: o, strategy: "ldconfig" };
      }
      let i = await Yt("openssl version -v");
      if (i) {
        ee(`Found openssl binary with version: ${i}`);
        let o = Xu(i);
        if (ee(`The parsed openssl version is: ${o}`), o) return { libssl: o, strategy: "openssl-binary" };
      }
      return ee("Couldn't find any version of libssl or OpenSSL in the system"), {};
    }
    __name(rc, "rc");
    async function Jo(e) {
      for (let r of e) {
        let t = await tc(r);
        if (t) return t;
      }
    }
    __name(Jo, "Jo");
    async function tc(e) {
      try {
        return (await mi.default.readdir(e)).find((t) => t.startsWith("libssl.so.") && !t.startsWith("libssl.so.0"));
      } catch (r) {
        if (r.code === "ENOENT") return;
        throw r;
      }
    }
    __name(tc, "tc");
    async function ir() {
      let { binaryTarget: e } = await Zo();
      return e;
    }
    __name(ir, "ir");
    function nc(e) {
      return e.binaryTarget !== void 0;
    }
    __name(nc, "nc");
    async function fi() {
      let { memoized: e, ...r } = await Zo();
      return r;
    }
    __name(fi, "fi");
    var Kt = {};
    async function Zo() {
      if (nc(Kt)) return Promise.resolve({ ...Kt, memoized: true });
      let e = await Yo(), r = ic(e);
      return Kt = { ...e, binaryTarget: r }, { ...Kt, memoized: false };
    }
    __name(Zo, "Zo");
    function ic(e) {
      let { platform: r, arch: t, archFromUname: n, libssl: i, targetDistro: o, familyDistro: s, originalDistro: a } = e;
      r === "linux" && !["x64", "arm64"].includes(t) && Jt(`Prisma only officially supports Linux on amd64 (x86_64) and arm64 (aarch64) system architectures (detected "${t}" instead). If you are using your own custom Prisma engines, you can ignore this warning, as long as you've compiled the engines for your system architecture "${n}".`);
      let l = "1.1.x";
      if (r === "linux" && i === void 0) {
        let c = hr({ familyDistro: s }).with({ familyDistro: "debian" }, () => "Please manually install OpenSSL via `apt-get update -y && apt-get install -y openssl` and try installing Prisma again. If you're running Prisma on Docker, add this command to your Dockerfile, or switch to an image that already has OpenSSL installed.").otherwise(() => "Please manually install OpenSSL and try installing Prisma again.");
        Jt(`Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-${l}".
${c}`);
      }
      let u = "debian";
      if (r === "linux" && o === void 0 && ee(`Distro is "${a}". Falling back to Prisma engines built for "${u}".`), r === "darwin" && t === "arm64") return "darwin-arm64";
      if (r === "darwin") return "darwin";
      if (r === "win32") return "windows";
      if (r === "freebsd") return o;
      if (r === "openbsd") return "openbsd";
      if (r === "netbsd") return "netbsd";
      if (r === "linux" && o === "nixos") return "linux-nixos";
      if (r === "linux" && t === "arm64") return `${o === "musl" ? "linux-musl-arm64" : "linux-arm64"}-openssl-${i || l}`;
      if (r === "linux" && t === "arm") return `linux-arm-openssl-${i || l}`;
      if (r === "linux" && o === "musl") {
        let c = "linux-musl";
        return !i || Xo(i) ? c : `${c}-openssl-${i}`;
      }
      return r === "linux" && o && i ? `${o}-openssl-${i}` : (r !== "linux" && Jt(`Prisma detected unknown OS "${r}" and may not work as expected. Defaulting to "linux".`), i ? `${u}-openssl-${i}` : o ? `${o}-openssl-${l}` : `${u}-openssl-${l}`);
    }
    __name(ic, "ic");
    async function oc(e) {
      try {
        return await e();
      } catch {
        return;
      }
    }
    __name(oc, "oc");
    function Yt(e) {
      return oc(async () => {
        let r = await Hu(e);
        return ee(`Command "${e}" successfully returned "${r.stdout}"`), r.stdout;
      });
    }
    __name(Yt, "Yt");
    async function sc() {
      return typeof Ht.default.machine == "function" ? Ht.default.machine() : (await Yt("uname -m"))?.trim();
    }
    __name(sc, "sc");
    function Xo(e) {
      return e.startsWith("1.");
    }
    __name(Xo, "Xo");
    var Xt = {};
    tr(Xt, { beep: /* @__PURE__ */ __name(() => kc, "beep"), clearScreen: /* @__PURE__ */ __name(() => Cc, "clearScreen"), clearTerminal: /* @__PURE__ */ __name(() => Ic, "clearTerminal"), cursorBackward: /* @__PURE__ */ __name(() => mc, "cursorBackward"), cursorDown: /* @__PURE__ */ __name(() => pc, "cursorDown"), cursorForward: /* @__PURE__ */ __name(() => dc, "cursorForward"), cursorGetPosition: /* @__PURE__ */ __name(() => hc, "cursorGetPosition"), cursorHide: /* @__PURE__ */ __name(() => Ec, "cursorHide"), cursorLeft: /* @__PURE__ */ __name(() => ts, "cursorLeft"), cursorMove: /* @__PURE__ */ __name(() => cc, "cursorMove"), cursorNextLine: /* @__PURE__ */ __name(() => yc, "cursorNextLine"), cursorPrevLine: /* @__PURE__ */ __name(() => bc, "cursorPrevLine"), cursorRestorePosition: /* @__PURE__ */ __name(() => gc, "cursorRestorePosition"), cursorSavePosition: /* @__PURE__ */ __name(() => fc, "cursorSavePosition"), cursorShow: /* @__PURE__ */ __name(() => wc, "cursorShow"), cursorTo: /* @__PURE__ */ __name(() => uc, "cursorTo"), cursorUp: /* @__PURE__ */ __name(() => rs, "cursorUp"), enterAlternativeScreen: /* @__PURE__ */ __name(() => Dc, "enterAlternativeScreen"), eraseDown: /* @__PURE__ */ __name(() => Tc, "eraseDown"), eraseEndLine: /* @__PURE__ */ __name(() => vc, "eraseEndLine"), eraseLine: /* @__PURE__ */ __name(() => ns, "eraseLine"), eraseLines: /* @__PURE__ */ __name(() => xc, "eraseLines"), eraseScreen: /* @__PURE__ */ __name(() => gi, "eraseScreen"), eraseStartLine: /* @__PURE__ */ __name(() => Pc, "eraseStartLine"), eraseUp: /* @__PURE__ */ __name(() => Sc, "eraseUp"), exitAlternativeScreen: /* @__PURE__ */ __name(() => Oc, "exitAlternativeScreen"), iTerm: /* @__PURE__ */ __name(() => Lc, "iTerm"), image: /* @__PURE__ */ __name(() => Nc, "image"), link: /* @__PURE__ */ __name(() => _c, "link"), scrollDown: /* @__PURE__ */ __name(() => Ac, "scrollDown"), scrollUp: /* @__PURE__ */ __name(() => Rc, "scrollUp") });
    var Zt = O(__require("node:process"), 1);
    var zt = globalThis.window?.document !== void 0;
    var gg = globalThis.process?.versions?.node !== void 0;
    var hg = globalThis.process?.versions?.bun !== void 0;
    var yg = globalThis.Deno?.version?.deno !== void 0;
    var bg = globalThis.process?.versions?.electron !== void 0;
    var Eg = globalThis.navigator?.userAgent?.includes("jsdom") === true;
    var wg = typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
    var xg = typeof DedicatedWorkerGlobalScope < "u" && globalThis instanceof DedicatedWorkerGlobalScope;
    var vg = typeof SharedWorkerGlobalScope < "u" && globalThis instanceof SharedWorkerGlobalScope;
    var Pg = typeof ServiceWorkerGlobalScope < "u" && globalThis instanceof ServiceWorkerGlobalScope;
    var Xr = globalThis.navigator?.userAgentData?.platform;
    var Tg = Xr === "macOS" || globalThis.navigator?.platform === "MacIntel" || globalThis.navigator?.userAgent?.includes(" Mac ") === true || globalThis.process?.platform === "darwin";
    var Sg = Xr === "Windows" || globalThis.navigator?.platform === "Win32" || globalThis.process?.platform === "win32";
    var Rg = Xr === "Linux" || globalThis.navigator?.platform?.startsWith("Linux") === true || globalThis.navigator?.userAgent?.includes(" Linux ") === true || globalThis.process?.platform === "linux";
    var Ag = Xr === "iOS" || globalThis.navigator?.platform === "MacIntel" && globalThis.navigator?.maxTouchPoints > 1 || /iPad|iPhone|iPod/.test(globalThis.navigator?.platform);
    var Cg = Xr === "Android" || globalThis.navigator?.platform === "Android" || globalThis.navigator?.userAgent?.includes(" Android ") === true || globalThis.process?.platform === "android";
    var C = "\x1B[";
    var rt = "\x1B]";
    var yr = "\x07";
    var et = ";";
    var es = !zt && Zt.default.env.TERM_PROGRAM === "Apple_Terminal";
    var ac = !zt && Zt.default.platform === "win32";
    var lc = zt ? () => {
      throw new Error("`process.cwd()` only works in Node.js, not the browser.");
    } : Zt.default.cwd;
    var uc = /* @__PURE__ */ __name((e, r) => {
      if (typeof e != "number") throw new TypeError("The `x` argument is required");
      return typeof r != "number" ? C + (e + 1) + "G" : C + (r + 1) + et + (e + 1) + "H";
    }, "uc");
    var cc = /* @__PURE__ */ __name((e, r) => {
      if (typeof e != "number") throw new TypeError("The `x` argument is required");
      let t = "";
      return e < 0 ? t += C + -e + "D" : e > 0 && (t += C + e + "C"), r < 0 ? t += C + -r + "A" : r > 0 && (t += C + r + "B"), t;
    }, "cc");
    var rs = /* @__PURE__ */ __name((e = 1) => C + e + "A", "rs");
    var pc = /* @__PURE__ */ __name((e = 1) => C + e + "B", "pc");
    var dc = /* @__PURE__ */ __name((e = 1) => C + e + "C", "dc");
    var mc = /* @__PURE__ */ __name((e = 1) => C + e + "D", "mc");
    var ts = C + "G";
    var fc = es ? "\x1B7" : C + "s";
    var gc = es ? "\x1B8" : C + "u";
    var hc = C + "6n";
    var yc = C + "E";
    var bc = C + "F";
    var Ec = C + "?25l";
    var wc = C + "?25h";
    var xc = /* @__PURE__ */ __name((e) => {
      let r = "";
      for (let t = 0; t < e; t++) r += ns + (t < e - 1 ? rs() : "");
      return e && (r += ts), r;
    }, "xc");
    var vc = C + "K";
    var Pc = C + "1K";
    var ns = C + "2K";
    var Tc = C + "J";
    var Sc = C + "1J";
    var gi = C + "2J";
    var Rc = C + "S";
    var Ac = C + "T";
    var Cc = "\x1Bc";
    var Ic = ac ? `${gi}${C}0f` : `${gi}${C}3J${C}H`;
    var Dc = C + "?1049h";
    var Oc = C + "?1049l";
    var kc = yr;
    var _c = /* @__PURE__ */ __name((e, r) => [rt, "8", et, et, r, yr, e, rt, "8", et, et, yr].join(""), "_c");
    var Nc = /* @__PURE__ */ __name((e, r = {}) => {
      let t = `${rt}1337;File=inline=1`;
      return r.width && (t += `;width=${r.width}`), r.height && (t += `;height=${r.height}`), r.preserveAspectRatio === false && (t += ";preserveAspectRatio=0"), t + ":" + Buffer.from(e).toString("base64") + yr;
    }, "Nc");
    var Lc = { setCwd: /* @__PURE__ */ __name((e = lc()) => `${rt}50;CurrentDir=${e}${yr}`, "setCwd"), annotation(e, r = {}) {
      let t = `${rt}1337;`, n = r.x !== void 0, i = r.y !== void 0;
      if ((n || i) && !(n && i && r.length !== void 0)) throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
      return e = e.replaceAll("|", ""), t += r.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=", r.length > 0 ? t += (n ? [e, r.length, r.x, r.y] : [r.length, e]).join("|") : t += e, t + yr;
    } };
    var en = O(cs(), 1);
    function or(e, r, { target: t = "stdout", ...n } = {}) {
      return en.default[t] ? Xt.link(e, r) : n.fallback === false ? e : typeof n.fallback == "function" ? n.fallback(e, r) : `${e} (​${r}​)`;
    }
    __name(or, "or");
    or.isSupported = en.default.stdout;
    or.stderr = (e, r, t = {}) => or(e, r, { target: "stderr", ...t });
    or.stderr.isSupported = en.default.stderr;
    function wi(e) {
      return or(e, e, { fallback: Y });
    }
    __name(wi, "wi");
    var Vc = ps();
    var xi = Vc.version;
    function Er(e) {
      let r = jc();
      return r || (e?.config.engineType === "library" ? "library" : e?.config.engineType === "binary" ? "binary" : e?.config.engineType === "client" ? "client" : Bc());
    }
    __name(Er, "Er");
    function jc() {
      let e = process.env.PRISMA_CLIENT_ENGINE_TYPE;
      return e === "library" ? "library" : e === "binary" ? "binary" : e === "client" ? "client" : void 0;
    }
    __name(jc, "jc");
    function Bc() {
      return "library";
    }
    __name(Bc, "Bc");
    function vi(e) {
      return e.name === "DriverAdapterError" && typeof e.cause == "object";
    }
    __name(vi, "vi");
    function rn(e) {
      return { ok: true, value: e, map(r) {
        return rn(r(e));
      }, flatMap(r) {
        return r(e);
      } };
    }
    __name(rn, "rn");
    function sr(e) {
      return { ok: false, error: e, map() {
        return sr(e);
      }, flatMap() {
        return sr(e);
      } };
    }
    __name(sr, "sr");
    var ds = N("driver-adapter-utils");
    var Pi = class {
      static {
        __name(this, "Pi");
      }
      registeredErrors = [];
      consumeError(r) {
        return this.registeredErrors[r];
      }
      registerNewError(r) {
        let t = 0;
        for (; this.registeredErrors[t] !== void 0; ) t++;
        return this.registeredErrors[t] = { error: r }, t;
      }
    };
    var tn = /* @__PURE__ */ __name((e, r = new Pi()) => {
      let t = { adapterName: e.adapterName, errorRegistry: r, queryRaw: ke(r, e.queryRaw.bind(e)), executeRaw: ke(r, e.executeRaw.bind(e)), executeScript: ke(r, e.executeScript.bind(e)), dispose: ke(r, e.dispose.bind(e)), provider: e.provider, startTransaction: /* @__PURE__ */ __name(async (...n) => (await ke(r, e.startTransaction.bind(e))(...n)).map((o) => Uc(r, o)), "startTransaction") };
      return e.getConnectionInfo && (t.getConnectionInfo = Gc(r, e.getConnectionInfo.bind(e))), t;
    }, "tn");
    var Uc = /* @__PURE__ */ __name((e, r) => ({ adapterName: r.adapterName, provider: r.provider, options: r.options, queryRaw: ke(e, r.queryRaw.bind(r)), executeRaw: ke(e, r.executeRaw.bind(r)), commit: ke(e, r.commit.bind(r)), rollback: ke(e, r.rollback.bind(r)) }), "Uc");
    function ke(e, r) {
      return async (...t) => {
        try {
          return rn(await r(...t));
        } catch (n) {
          if (ds("[error@wrapAsync]", n), vi(n)) return sr(n.cause);
          let i = e.registerNewError(n);
          return sr({ kind: "GenericJs", id: i });
        }
      };
    }
    __name(ke, "ke");
    function Gc(e, r) {
      return (...t) => {
        try {
          return rn(r(...t));
        } catch (n) {
          if (ds("[error@wrapSync]", n), vi(n)) return sr(n.cause);
          let i = e.registerNewError(n);
          return sr({ kind: "GenericJs", id: i });
        }
      };
    }
    __name(Gc, "Gc");
    var Wc = O(on());
    var M = O(__require("node:path"));
    var Jc = O(on());
    var wh = N("prisma:engines");
    function ms() {
      return M.default.join(__dirname, "../");
    }
    __name(ms, "ms");
    M.default.join(__dirname, "../query-engine-darwin");
    M.default.join(__dirname, "../query-engine-darwin-arm64");
    M.default.join(__dirname, "../query-engine-debian-openssl-1.0.x");
    M.default.join(__dirname, "../query-engine-debian-openssl-1.1.x");
    M.default.join(__dirname, "../query-engine-debian-openssl-3.0.x");
    M.default.join(__dirname, "../query-engine-linux-static-x64");
    M.default.join(__dirname, "../query-engine-linux-static-arm64");
    M.default.join(__dirname, "../query-engine-rhel-openssl-1.0.x");
    M.default.join(__dirname, "../query-engine-rhel-openssl-1.1.x");
    M.default.join(__dirname, "../query-engine-rhel-openssl-3.0.x");
    M.default.join(__dirname, "../libquery_engine-darwin.dylib.node");
    M.default.join(__dirname, "../libquery_engine-darwin-arm64.dylib.node");
    M.default.join(__dirname, "../libquery_engine-debian-openssl-1.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-debian-openssl-1.1.x.so.node");
    M.default.join(__dirname, "../libquery_engine-debian-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.1.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-arm64-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-musl.so.node");
    M.default.join(__dirname, "../libquery_engine-linux-musl-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-rhel-openssl-1.0.x.so.node");
    M.default.join(__dirname, "../libquery_engine-rhel-openssl-1.1.x.so.node");
    M.default.join(__dirname, "../libquery_engine-rhel-openssl-3.0.x.so.node");
    M.default.join(__dirname, "../query_engine-windows.dll.node");
    var Si = O(__require("node:fs"));
    var fs = gr("chmodPlusX");
    function Ri(e) {
      if (process.platform === "win32") return;
      let r = Si.default.statSync(e), t = r.mode | 64 | 8 | 1;
      if (r.mode === t) {
        fs(`Execution permissions of ${e} are fine`);
        return;
      }
      let n = t.toString(8).slice(-3);
      fs(`Have to call chmodPlusX on ${e}`), Si.default.chmodSync(e, n);
    }
    __name(Ri, "Ri");
    function Ai(e) {
      let r = e.e, t = /* @__PURE__ */ __name((a) => `Prisma cannot find the required \`${a}\` system library in your system`, "t"), n = r.message.includes("cannot open shared object file"), i = `Please refer to the documentation about Prisma's system requirements: ${wi("https://pris.ly/d/system-requirements")}`, o = `Unable to require(\`${Ce(e.id)}\`).`, s = hr({ message: r.message, code: r.code }).with({ code: "ENOENT" }, () => "File does not exist.").when(({ message: a }) => n && a.includes("libz"), () => `${t("libz")}. Please install it and try again.`).when(({ message: a }) => n && a.includes("libgcc_s"), () => `${t("libgcc_s")}. Please install it and try again.`).when(({ message: a }) => n && a.includes("libssl"), () => {
        let a = e.platformInfo.libssl ? `openssl-${e.platformInfo.libssl}` : "openssl";
        return `${t("libssl")}. Please install ${a} and try again.`;
      }).when(({ message: a }) => a.includes("GLIBC"), () => `Prisma has detected an incompatible version of the \`glibc\` C standard library installed in your system. This probably means your system may be too old to run Prisma. ${i}`).when(({ message: a }) => e.platformInfo.platform === "linux" && a.includes("symbol not found"), () => `The Prisma engines are not compatible with your system ${e.platformInfo.originalDistro} on (${e.platformInfo.archFromUname}) which uses the \`${e.platformInfo.binaryTarget}\` binaryTarget by default. ${i}`).otherwise(() => `The Prisma engines do not seem to be compatible with your system. ${i}`);
      return `${o}
${s}

Details: ${r.message}`;
    }
    __name(Ai, "Ai");
    var ys = O(hs(), 1);
    function Ci(e) {
      let r = (0, ys.default)(e);
      if (r === 0) return e;
      let t = new RegExp(`^[ \\t]{${r}}`, "gm");
      return e.replace(t, "");
    }
    __name(Ci, "Ci");
    var bs = "prisma+postgres";
    var sn = `${bs}:`;
    function an(e) {
      return e?.toString().startsWith(`${sn}//`) ?? false;
    }
    __name(an, "an");
    function Ii(e) {
      if (!an(e)) return false;
      let { host: r } = new URL(e);
      return r.includes("localhost") || r.includes("127.0.0.1") || r.includes("[::1]");
    }
    __name(Ii, "Ii");
    var ws = O(Di());
    function ki(e) {
      return String(new Oi(e));
    }
    __name(ki, "ki");
    var Oi = class {
      static {
        __name(this, "Oi");
      }
      constructor(r) {
        this.config = r;
      }
      toString() {
        let { config: r } = this, t = r.provider.fromEnvVar ? `env("${r.provider.fromEnvVar}")` : r.provider.value, n = JSON.parse(JSON.stringify({ provider: t, binaryTargets: Kc(r.binaryTargets) }));
        return `generator ${r.name} {
${(0, ws.default)(Hc(n), 2)}
}`;
      }
    };
    function Kc(e) {
      let r;
      if (e.length > 0) {
        let t = e.find((n) => n.fromEnvVar !== null);
        t ? r = `env("${t.fromEnvVar}")` : r = e.map((n) => n.native ? "native" : n.value);
      } else r = void 0;
      return r;
    }
    __name(Kc, "Kc");
    function Hc(e) {
      let r = Object.keys(e).reduce((t, n) => Math.max(t, n.length), 0);
      return Object.entries(e).map(([t, n]) => `${t.padEnd(r)} = ${Yc(n)}`).join(`
`);
    }
    __name(Hc, "Hc");
    function Yc(e) {
      return JSON.parse(JSON.stringify(e, (r, t) => Array.isArray(t) ? `[${t.map((n) => JSON.stringify(n)).join(", ")}]` : JSON.stringify(t)));
    }
    __name(Yc, "Yc");
    var nt = {};
    tr(nt, { error: /* @__PURE__ */ __name(() => Xc, "error"), info: /* @__PURE__ */ __name(() => Zc, "info"), log: /* @__PURE__ */ __name(() => zc, "log"), query: /* @__PURE__ */ __name(() => ep, "query"), should: /* @__PURE__ */ __name(() => xs, "should"), tags: /* @__PURE__ */ __name(() => tt, "tags"), warn: /* @__PURE__ */ __name(() => _i, "warn") });
    var tt = { error: ce("prisma:error"), warn: Ie("prisma:warn"), info: De("prisma:info"), query: nr("prisma:query") };
    var xs = { warn: /* @__PURE__ */ __name(() => !process.env.PRISMA_DISABLE_WARNINGS, "warn") };
    function zc(...e) {
      console.log(...e);
    }
    __name(zc, "zc");
    function _i(e, ...r) {
      xs.warn() && console.warn(`${tt.warn} ${e}`, ...r);
    }
    __name(_i, "_i");
    function Zc(e, ...r) {
      console.info(`${tt.info} ${e}`, ...r);
    }
    __name(Zc, "Zc");
    function Xc(e, ...r) {
      console.error(`${tt.error} ${e}`, ...r);
    }
    __name(Xc, "Xc");
    function ep(e, ...r) {
      console.log(`${tt.query} ${e}`, ...r);
    }
    __name(ep, "ep");
    function ln(e, r) {
      if (!e) throw new Error(`${r}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`);
    }
    __name(ln, "ln");
    function ar(e, r) {
      throw new Error(r);
    }
    __name(ar, "ar");
    function Ni({ onlyFirst: e = false } = {}) {
      let t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
      return new RegExp(t, e ? void 0 : "g");
    }
    __name(Ni, "Ni");
    var rp = Ni();
    function wr(e) {
      if (typeof e != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);
      return e.replace(rp, "");
    }
    __name(wr, "wr");
    var it = O(__require("node:path"));
    function Li(e) {
      return it.default.sep === it.default.posix.sep ? e : e.split(it.default.sep).join(it.default.posix.sep);
    }
    __name(Li, "Li");
    var qi = O(As());
    var un = O(__require("node:fs"));
    var xr = O(__require("node:path"));
    function Cs(e) {
      let r = e.ignoreProcessEnv ? {} : process.env, t = /* @__PURE__ */ __name((n) => n.match(/(.?\${(?:[a-zA-Z0-9_]+)?})/g)?.reduce(function(o, s) {
        let a = /(.?)\${([a-zA-Z0-9_]+)?}/g.exec(s);
        if (!a) return o;
        let l = a[1], u, c;
        if (l === "\\") c = a[0], u = c.replace("\\$", "$");
        else {
          let p = a[2];
          c = a[0].substring(l.length), u = Object.hasOwnProperty.call(r, p) ? r[p] : e.parsed[p] || "", u = t(u);
        }
        return o.replace(c, u);
      }, n) ?? n, "t");
      for (let n in e.parsed) {
        let i = Object.hasOwnProperty.call(r, n) ? r[n] : e.parsed[n];
        e.parsed[n] = t(i);
      }
      for (let n in e.parsed) r[n] = e.parsed[n];
      return e;
    }
    __name(Cs, "Cs");
    var $i = gr("prisma:tryLoadEnv");
    function st({ rootEnvPath: e, schemaEnvPath: r }, t = { conflictCheck: "none" }) {
      let n = Is(e);
      t.conflictCheck !== "none" && hp(n, r, t.conflictCheck);
      let i = null;
      return Ds(n?.path, r) || (i = Is(r)), !n && !i && $i("No Environment variables loaded"), i?.dotenvResult.error ? console.error(ce(W("Schema Env Error: ")) + i.dotenvResult.error) : { message: [n?.message, i?.message].filter(Boolean).join(`
`), parsed: { ...n?.dotenvResult?.parsed, ...i?.dotenvResult?.parsed } };
    }
    __name(st, "st");
    function hp(e, r, t) {
      let n = e?.dotenvResult.parsed, i = !Ds(e?.path, r);
      if (n && r && i && un.default.existsSync(r)) {
        let o = qi.default.parse(un.default.readFileSync(r)), s = [];
        for (let a in o) n[a] === o[a] && s.push(a);
        if (s.length > 0) {
          let a = xr.default.relative(process.cwd(), e.path), l = xr.default.relative(process.cwd(), r);
          if (t === "error") {
            let u = `There is a conflict between env var${s.length > 1 ? "s" : ""} in ${Y(a)} and ${Y(l)}
Conflicting env vars:
${s.map((c) => `  ${W(c)}`).join(`
`)}

We suggest to move the contents of ${Y(l)} to ${Y(a)} to consolidate your env vars.
`;
            throw new Error(u);
          } else if (t === "warn") {
            let u = `Conflict for env var${s.length > 1 ? "s" : ""} ${s.map((c) => W(c)).join(", ")} in ${Y(a)} and ${Y(l)}
Env vars from ${Y(l)} overwrite the ones from ${Y(a)}
      `;
            console.warn(`${Ie("warn(prisma)")} ${u}`);
          }
        }
      }
    }
    __name(hp, "hp");
    function Is(e) {
      if (yp(e)) {
        $i(`Environment variables loaded from ${e}`);
        let r = qi.default.config({ path: e, debug: process.env.DOTENV_CONFIG_DEBUG ? true : void 0 });
        return { dotenvResult: Cs(r), message: Ce(`Environment variables loaded from ${xr.default.relative(process.cwd(), e)}`), path: e };
      } else $i(`Environment variables not found at ${e}`);
      return null;
    }
    __name(Is, "Is");
    function Ds(e, r) {
      return e && r && xr.default.resolve(e) === xr.default.resolve(r);
    }
    __name(Ds, "Ds");
    function yp(e) {
      return !!(e && un.default.existsSync(e));
    }
    __name(yp, "yp");
    function Vi(e, r) {
      return Object.prototype.hasOwnProperty.call(e, r);
    }
    __name(Vi, "Vi");
    function pn(e, r) {
      let t = {};
      for (let n of Object.keys(e)) t[n] = r(e[n], n);
      return t;
    }
    __name(pn, "pn");
    function ji(e, r) {
      if (e.length === 0) return;
      let t = e[0];
      for (let n = 1; n < e.length; n++) r(t, e[n]) < 0 && (t = e[n]);
      return t;
    }
    __name(ji, "ji");
    function x(e, r) {
      Object.defineProperty(e, "name", { value: r, configurable: true });
    }
    __name(x, "x");
    var ks = /* @__PURE__ */ new Set();
    var at = /* @__PURE__ */ __name((e, r, ...t) => {
      ks.has(e) || (ks.add(e), _i(r, ...t));
    }, "at");
    var P = class e extends Error {
      static {
        __name(this, "e");
      }
      clientVersion;
      errorCode;
      retryable;
      constructor(r, t, n) {
        super(r), this.name = "PrismaClientInitializationError", this.clientVersion = t, this.errorCode = n, Error.captureStackTrace(e);
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientInitializationError";
      }
    };
    x(P, "PrismaClientInitializationError");
    var z = class extends Error {
      static {
        __name(this, "z");
      }
      code;
      meta;
      clientVersion;
      batchRequestIdx;
      constructor(r, { code: t, clientVersion: n, meta: i, batchRequestIdx: o }) {
        super(r), this.name = "PrismaClientKnownRequestError", this.code = t, this.clientVersion = n, this.meta = i, Object.defineProperty(this, "batchRequestIdx", { value: o, enumerable: false, writable: true });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientKnownRequestError";
      }
    };
    x(z, "PrismaClientKnownRequestError");
    var ae = class extends Error {
      static {
        __name(this, "ae");
      }
      clientVersion;
      constructor(r, t) {
        super(r), this.name = "PrismaClientRustPanicError", this.clientVersion = t;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientRustPanicError";
      }
    };
    x(ae, "PrismaClientRustPanicError");
    var V = class extends Error {
      static {
        __name(this, "V");
      }
      clientVersion;
      batchRequestIdx;
      constructor(r, { clientVersion: t, batchRequestIdx: n }) {
        super(r), this.name = "PrismaClientUnknownRequestError", this.clientVersion = t, Object.defineProperty(this, "batchRequestIdx", { value: n, writable: true, enumerable: false });
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientUnknownRequestError";
      }
    };
    x(V, "PrismaClientUnknownRequestError");
    var Z = class extends Error {
      static {
        __name(this, "Z");
      }
      name = "PrismaClientValidationError";
      clientVersion;
      constructor(r, { clientVersion: t }) {
        super(r), this.clientVersion = t;
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientValidationError";
      }
    };
    x(Z, "PrismaClientValidationError");
    var we = class {
      static {
        __name(this, "we");
      }
      _map = /* @__PURE__ */ new Map();
      get(r) {
        return this._map.get(r)?.value;
      }
      set(r, t) {
        this._map.set(r, { value: t });
      }
      getOrCreate(r, t) {
        let n = this._map.get(r);
        if (n) return n.value;
        let i = t();
        return this.set(r, i), i;
      }
    };
    function We(e) {
      return e.substring(0, 1).toLowerCase() + e.substring(1);
    }
    __name(We, "We");
    function _s(e, r) {
      let t = {};
      for (let n of e) {
        let i = n[r];
        t[i] = n;
      }
      return t;
    }
    __name(_s, "_s");
    function lt(e) {
      let r;
      return { get() {
        return r || (r = { value: e() }), r.value;
      } };
    }
    __name(lt, "lt");
    function Ns(e) {
      return { models: Bi(e.models), enums: Bi(e.enums), types: Bi(e.types) };
    }
    __name(Ns, "Ns");
    function Bi(e) {
      let r = {};
      for (let { name: t, ...n } of e) r[t] = n;
      return r;
    }
    __name(Bi, "Bi");
    function vr(e) {
      return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]";
    }
    __name(vr, "vr");
    function mn(e) {
      return e.toString() !== "Invalid Date";
    }
    __name(mn, "mn");
    var Pr = 9e15;
    var Ye = 1e9;
    var Ui = "0123456789abcdef";
    var hn = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
    var yn = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
    var Gi = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -Pr, maxE: Pr, crypto: false };
    var $s;
    var Ne;
    var w = true;
    var En = "[DecimalError] ";
    var He = En + "Invalid argument: ";
    var qs = En + "Precision limit exceeded";
    var Vs = En + "crypto unavailable";
    var js = "[object Decimal]";
    var X = Math.floor;
    var U = Math.pow;
    var bp = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
    var Ep = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
    var wp = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
    var Bs = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    var fe = 1e7;
    var E = 7;
    var xp = 9007199254740991;
    var vp = hn.length - 1;
    var Qi = yn.length - 1;
    var m = { toStringTag: js };
    m.absoluteValue = m.abs = function() {
      var e = new this.constructor(this);
      return e.s < 0 && (e.s = 1), y(e);
    };
    m.ceil = function() {
      return y(new this.constructor(this), this.e + 1, 2);
    };
    m.clampedTo = m.clamp = function(e, r) {
      var t, n = this, i = n.constructor;
      if (e = new i(e), r = new i(r), !e.s || !r.s) return new i(NaN);
      if (e.gt(r)) throw Error(He + r);
      return t = n.cmp(e), t < 0 ? e : n.cmp(r) > 0 ? r : new i(n);
    };
    m.comparedTo = m.cmp = function(e) {
      var r, t, n, i, o = this, s = o.d, a = (e = new o.constructor(e)).d, l = o.s, u = e.s;
      if (!s || !a) return !l || !u ? NaN : l !== u ? l : s === a ? 0 : !s ^ l < 0 ? 1 : -1;
      if (!s[0] || !a[0]) return s[0] ? l : a[0] ? -u : 0;
      if (l !== u) return l;
      if (o.e !== e.e) return o.e > e.e ^ l < 0 ? 1 : -1;
      for (n = s.length, i = a.length, r = 0, t = n < i ? n : i; r < t; ++r) if (s[r] !== a[r]) return s[r] > a[r] ^ l < 0 ? 1 : -1;
      return n === i ? 0 : n > i ^ l < 0 ? 1 : -1;
    };
    m.cosine = m.cos = function() {
      var e, r, t = this, n = t.constructor;
      return t.d ? t.d[0] ? (e = n.precision, r = n.rounding, n.precision = e + Math.max(t.e, t.sd()) + E, n.rounding = 1, t = Pp(n, Js(n, t)), n.precision = e, n.rounding = r, y(Ne == 2 || Ne == 3 ? t.neg() : t, e, r, true)) : new n(1) : new n(NaN);
    };
    m.cubeRoot = m.cbrt = function() {
      var e, r, t, n, i, o, s, a, l, u, c = this, p = c.constructor;
      if (!c.isFinite() || c.isZero()) return new p(c);
      for (w = false, o = c.s * U(c.s * c, 1 / 3), !o || Math.abs(o) == 1 / 0 ? (t = J(c.d), e = c.e, (o = (e - t.length + 1) % 3) && (t += o == 1 || o == -2 ? "0" : "00"), o = U(t, 1 / 3), e = X((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2)), o == 1 / 0 ? t = "5e" + e : (t = o.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e), n = new p(t), n.s = c.s) : n = new p(o.toString()), s = (e = p.precision) + 3; ; ) if (a = n, l = a.times(a).times(a), u = l.plus(c), n = L(u.plus(c).times(a), u.plus(l), s + 2, 1), J(a.d).slice(0, s) === (t = J(n.d)).slice(0, s)) if (t = t.slice(s - 3, s + 1), t == "9999" || !i && t == "4999") {
        if (!i && (y(a, e + 1, 0), a.times(a).times(a).eq(c))) {
          n = a;
          break;
        }
        s += 4, i = 1;
      } else {
        (!+t || !+t.slice(1) && t.charAt(0) == "5") && (y(n, e + 1, 1), r = !n.times(n).times(n).eq(c));
        break;
      }
      return w = true, y(n, e, p.rounding, r);
    };
    m.decimalPlaces = m.dp = function() {
      var e, r = this.d, t = NaN;
      if (r) {
        if (e = r.length - 1, t = (e - X(this.e / E)) * E, e = r[e], e) for (; e % 10 == 0; e /= 10) t--;
        t < 0 && (t = 0);
      }
      return t;
    };
    m.dividedBy = m.div = function(e) {
      return L(this, new this.constructor(e));
    };
    m.dividedToIntegerBy = m.divToInt = function(e) {
      var r = this, t = r.constructor;
      return y(L(r, new t(e), 0, 1, 1), t.precision, t.rounding);
    };
    m.equals = m.eq = function(e) {
      return this.cmp(e) === 0;
    };
    m.floor = function() {
      return y(new this.constructor(this), this.e + 1, 3);
    };
    m.greaterThan = m.gt = function(e) {
      return this.cmp(e) > 0;
    };
    m.greaterThanOrEqualTo = m.gte = function(e) {
      var r = this.cmp(e);
      return r == 1 || r === 0;
    };
    m.hyperbolicCosine = m.cosh = function() {
      var e, r, t, n, i, o = this, s = o.constructor, a = new s(1);
      if (!o.isFinite()) return new s(o.s ? 1 / 0 : NaN);
      if (o.isZero()) return a;
      t = s.precision, n = s.rounding, s.precision = t + Math.max(o.e, o.sd()) + 4, s.rounding = 1, i = o.d.length, i < 32 ? (e = Math.ceil(i / 3), r = (1 / xn(4, e)).toString()) : (e = 16, r = "2.3283064365386962890625e-10"), o = Tr(s, 1, o.times(r), new s(1), true);
      for (var l, u = e, c = new s(8); u--; ) l = o.times(o), o = a.minus(l.times(c.minus(l.times(c))));
      return y(o, s.precision = t, s.rounding = n, true);
    };
    m.hyperbolicSine = m.sinh = function() {
      var e, r, t, n, i = this, o = i.constructor;
      if (!i.isFinite() || i.isZero()) return new o(i);
      if (r = o.precision, t = o.rounding, o.precision = r + Math.max(i.e, i.sd()) + 4, o.rounding = 1, n = i.d.length, n < 3) i = Tr(o, 2, i, i, true);
      else {
        e = 1.4 * Math.sqrt(n), e = e > 16 ? 16 : e | 0, i = i.times(1 / xn(5, e)), i = Tr(o, 2, i, i, true);
        for (var s, a = new o(5), l = new o(16), u = new o(20); e--; ) s = i.times(i), i = i.times(a.plus(s.times(l.times(s).plus(u))));
      }
      return o.precision = r, o.rounding = t, y(i, r, t, true);
    };
    m.hyperbolicTangent = m.tanh = function() {
      var e, r, t = this, n = t.constructor;
      return t.isFinite() ? t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + 7, n.rounding = 1, L(t.sinh(), t.cosh(), n.precision = e, n.rounding = r)) : new n(t.s);
    };
    m.inverseCosine = m.acos = function() {
      var e = this, r = e.constructor, t = e.abs().cmp(1), n = r.precision, i = r.rounding;
      return t !== -1 ? t === 0 ? e.isNeg() ? xe(r, n, i) : new r(0) : new r(NaN) : e.isZero() ? xe(r, n + 4, i).times(0.5) : (r.precision = n + 6, r.rounding = 1, e = new r(1).minus(e).div(e.plus(1)).sqrt().atan(), r.precision = n, r.rounding = i, e.times(2));
    };
    m.inverseHyperbolicCosine = m.acosh = function() {
      var e, r, t = this, n = t.constructor;
      return t.lte(1) ? new n(t.eq(1) ? 0 : NaN) : t.isFinite() ? (e = n.precision, r = n.rounding, n.precision = e + Math.max(Math.abs(t.e), t.sd()) + 4, n.rounding = 1, w = false, t = t.times(t).minus(1).sqrt().plus(t), w = true, n.precision = e, n.rounding = r, t.ln()) : new n(t);
    };
    m.inverseHyperbolicSine = m.asinh = function() {
      var e, r, t = this, n = t.constructor;
      return !t.isFinite() || t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + 2 * Math.max(Math.abs(t.e), t.sd()) + 6, n.rounding = 1, w = false, t = t.times(t).plus(1).sqrt().plus(t), w = true, n.precision = e, n.rounding = r, t.ln());
    };
    m.inverseHyperbolicTangent = m.atanh = function() {
      var e, r, t, n, i = this, o = i.constructor;
      return i.isFinite() ? i.e >= 0 ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e = o.precision, r = o.rounding, n = i.sd(), Math.max(n, e) < 2 * -i.e - 1 ? y(new o(i), e, r, true) : (o.precision = t = n - i.e, i = L(i.plus(1), new o(1).minus(i), t + e, 1), o.precision = e + 4, o.rounding = 1, i = i.ln(), o.precision = e, o.rounding = r, i.times(0.5))) : new o(NaN);
    };
    m.inverseSine = m.asin = function() {
      var e, r, t, n, i = this, o = i.constructor;
      return i.isZero() ? new o(i) : (r = i.abs().cmp(1), t = o.precision, n = o.rounding, r !== -1 ? r === 0 ? (e = xe(o, t + 4, n).times(0.5), e.s = i.s, e) : new o(NaN) : (o.precision = t + 6, o.rounding = 1, i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(), o.precision = t, o.rounding = n, i.times(2)));
    };
    m.inverseTangent = m.atan = function() {
      var e, r, t, n, i, o, s, a, l, u = this, c = u.constructor, p = c.precision, d = c.rounding;
      if (u.isFinite()) {
        if (u.isZero()) return new c(u);
        if (u.abs().eq(1) && p + 4 <= Qi) return s = xe(c, p + 4, d).times(0.25), s.s = u.s, s;
      } else {
        if (!u.s) return new c(NaN);
        if (p + 4 <= Qi) return s = xe(c, p + 4, d).times(0.5), s.s = u.s, s;
      }
      for (c.precision = a = p + 10, c.rounding = 1, t = Math.min(28, a / E + 2 | 0), e = t; e; --e) u = u.div(u.times(u).plus(1).sqrt().plus(1));
      for (w = false, r = Math.ceil(a / E), n = 1, l = u.times(u), s = new c(u), i = u; e !== -1; ) if (i = i.times(l), o = s.minus(i.div(n += 2)), i = i.times(l), s = o.plus(i.div(n += 2)), s.d[r] !== void 0) for (e = r; s.d[e] === o.d[e] && e--; ) ;
      return t && (s = s.times(2 << t - 1)), w = true, y(s, c.precision = p, c.rounding = d, true);
    };
    m.isFinite = function() {
      return !!this.d;
    };
    m.isInteger = m.isInt = function() {
      return !!this.d && X(this.e / E) > this.d.length - 2;
    };
    m.isNaN = function() {
      return !this.s;
    };
    m.isNegative = m.isNeg = function() {
      return this.s < 0;
    };
    m.isPositive = m.isPos = function() {
      return this.s > 0;
    };
    m.isZero = function() {
      return !!this.d && this.d[0] === 0;
    };
    m.lessThan = m.lt = function(e) {
      return this.cmp(e) < 0;
    };
    m.lessThanOrEqualTo = m.lte = function(e) {
      return this.cmp(e) < 1;
    };
    m.logarithm = m.log = function(e) {
      var r, t, n, i, o, s, a, l, u = this, c = u.constructor, p = c.precision, d = c.rounding, f = 5;
      if (e == null) e = new c(10), r = true;
      else {
        if (e = new c(e), t = e.d, e.s < 0 || !t || !t[0] || e.eq(1)) return new c(NaN);
        r = e.eq(10);
      }
      if (t = u.d, u.s < 0 || !t || !t[0] || u.eq(1)) return new c(t && !t[0] ? -1 / 0 : u.s != 1 ? NaN : t ? 0 : 1 / 0);
      if (r) if (t.length > 1) o = true;
      else {
        for (i = t[0]; i % 10 === 0; ) i /= 10;
        o = i !== 1;
      }
      if (w = false, a = p + f, s = Ke(u, a), n = r ? bn(c, a + 10) : Ke(e, a), l = L(s, n, a, 1), ut(l.d, i = p, d)) do
        if (a += 10, s = Ke(u, a), n = r ? bn(c, a + 10) : Ke(e, a), l = L(s, n, a, 1), !o) {
          +J(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = y(l, p + 1, 0));
          break;
        }
      while (ut(l.d, i += 10, d));
      return w = true, y(l, p, d);
    };
    m.minus = m.sub = function(e) {
      var r, t, n, i, o, s, a, l, u, c, p, d, f = this, h = f.constructor;
      if (e = new h(e), !f.d || !e.d) return !f.s || !e.s ? e = new h(NaN) : f.d ? e.s = -e.s : e = new h(e.d || f.s !== e.s ? f : NaN), e;
      if (f.s != e.s) return e.s = -e.s, f.plus(e);
      if (u = f.d, d = e.d, a = h.precision, l = h.rounding, !u[0] || !d[0]) {
        if (d[0]) e.s = -e.s;
        else if (u[0]) e = new h(f);
        else return new h(l === 3 ? -0 : 0);
        return w ? y(e, a, l) : e;
      }
      if (t = X(e.e / E), c = X(f.e / E), u = u.slice(), o = c - t, o) {
        for (p = o < 0, p ? (r = u, o = -o, s = d.length) : (r = d, t = c, s = u.length), n = Math.max(Math.ceil(a / E), s) + 2, o > n && (o = n, r.length = 1), r.reverse(), n = o; n--; ) r.push(0);
        r.reverse();
      } else {
        for (n = u.length, s = d.length, p = n < s, p && (s = n), n = 0; n < s; n++) if (u[n] != d[n]) {
          p = u[n] < d[n];
          break;
        }
        o = 0;
      }
      for (p && (r = u, u = d, d = r, e.s = -e.s), s = u.length, n = d.length - s; n > 0; --n) u[s++] = 0;
      for (n = d.length; n > o; ) {
        if (u[--n] < d[n]) {
          for (i = n; i && u[--i] === 0; ) u[i] = fe - 1;
          --u[i], u[n] += fe;
        }
        u[n] -= d[n];
      }
      for (; u[--s] === 0; ) u.pop();
      for (; u[0] === 0; u.shift()) --t;
      return u[0] ? (e.d = u, e.e = wn(u, t), w ? y(e, a, l) : e) : new h(l === 3 ? -0 : 0);
    };
    m.modulo = m.mod = function(e) {
      var r, t = this, n = t.constructor;
      return e = new n(e), !t.d || !e.s || e.d && !e.d[0] ? new n(NaN) : !e.d || t.d && !t.d[0] ? y(new n(t), n.precision, n.rounding) : (w = false, n.modulo == 9 ? (r = L(t, e.abs(), 0, 3, 1), r.s *= e.s) : r = L(t, e, 0, n.modulo, 1), r = r.times(e), w = true, t.minus(r));
    };
    m.naturalExponential = m.exp = function() {
      return Wi(this);
    };
    m.naturalLogarithm = m.ln = function() {
      return Ke(this);
    };
    m.negated = m.neg = function() {
      var e = new this.constructor(this);
      return e.s = -e.s, y(e);
    };
    m.plus = m.add = function(e) {
      var r, t, n, i, o, s, a, l, u, c, p = this, d = p.constructor;
      if (e = new d(e), !p.d || !e.d) return !p.s || !e.s ? e = new d(NaN) : p.d || (e = new d(e.d || p.s === e.s ? p : NaN)), e;
      if (p.s != e.s) return e.s = -e.s, p.minus(e);
      if (u = p.d, c = e.d, a = d.precision, l = d.rounding, !u[0] || !c[0]) return c[0] || (e = new d(p)), w ? y(e, a, l) : e;
      if (o = X(p.e / E), n = X(e.e / E), u = u.slice(), i = o - n, i) {
        for (i < 0 ? (t = u, i = -i, s = c.length) : (t = c, n = o, s = u.length), o = Math.ceil(a / E), s = o > s ? o + 1 : s + 1, i > s && (i = s, t.length = 1), t.reverse(); i--; ) t.push(0);
        t.reverse();
      }
      for (s = u.length, i = c.length, s - i < 0 && (i = s, t = c, c = u, u = t), r = 0; i; ) r = (u[--i] = u[i] + c[i] + r) / fe | 0, u[i] %= fe;
      for (r && (u.unshift(r), ++n), s = u.length; u[--s] == 0; ) u.pop();
      return e.d = u, e.e = wn(u, n), w ? y(e, a, l) : e;
    };
    m.precision = m.sd = function(e) {
      var r, t = this;
      if (e !== void 0 && e !== !!e && e !== 1 && e !== 0) throw Error(He + e);
      return t.d ? (r = Us(t.d), e && t.e + 1 > r && (r = t.e + 1)) : r = NaN, r;
    };
    m.round = function() {
      var e = this, r = e.constructor;
      return y(new r(e), e.e + 1, r.rounding);
    };
    m.sine = m.sin = function() {
      var e, r, t = this, n = t.constructor;
      return t.isFinite() ? t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + Math.max(t.e, t.sd()) + E, n.rounding = 1, t = Sp(n, Js(n, t)), n.precision = e, n.rounding = r, y(Ne > 2 ? t.neg() : t, e, r, true)) : new n(NaN);
    };
    m.squareRoot = m.sqrt = function() {
      var e, r, t, n, i, o, s = this, a = s.d, l = s.e, u = s.s, c = s.constructor;
      if (u !== 1 || !a || !a[0]) return new c(!u || u < 0 && (!a || a[0]) ? NaN : a ? s : 1 / 0);
      for (w = false, u = Math.sqrt(+s), u == 0 || u == 1 / 0 ? (r = J(a), (r.length + l) % 2 == 0 && (r += "0"), u = Math.sqrt(r), l = X((l + 1) / 2) - (l < 0 || l % 2), u == 1 / 0 ? r = "5e" + l : (r = u.toExponential(), r = r.slice(0, r.indexOf("e") + 1) + l), n = new c(r)) : n = new c(u.toString()), t = (l = c.precision) + 3; ; ) if (o = n, n = o.plus(L(s, o, t + 2, 1)).times(0.5), J(o.d).slice(0, t) === (r = J(n.d)).slice(0, t)) if (r = r.slice(t - 3, t + 1), r == "9999" || !i && r == "4999") {
        if (!i && (y(o, l + 1, 0), o.times(o).eq(s))) {
          n = o;
          break;
        }
        t += 4, i = 1;
      } else {
        (!+r || !+r.slice(1) && r.charAt(0) == "5") && (y(n, l + 1, 1), e = !n.times(n).eq(s));
        break;
      }
      return w = true, y(n, l, c.rounding, e);
    };
    m.tangent = m.tan = function() {
      var e, r, t = this, n = t.constructor;
      return t.isFinite() ? t.isZero() ? new n(t) : (e = n.precision, r = n.rounding, n.precision = e + 10, n.rounding = 1, t = t.sin(), t.s = 1, t = L(t, new n(1).minus(t.times(t)).sqrt(), e + 10, 0), n.precision = e, n.rounding = r, y(Ne == 2 || Ne == 4 ? t.neg() : t, e, r, true)) : new n(NaN);
    };
    m.times = m.mul = function(e) {
      var r, t, n, i, o, s, a, l, u, c = this, p = c.constructor, d = c.d, f = (e = new p(e)).d;
      if (e.s *= c.s, !d || !d[0] || !f || !f[0]) return new p(!e.s || d && !d[0] && !f || f && !f[0] && !d ? NaN : !d || !f ? e.s / 0 : e.s * 0);
      for (t = X(c.e / E) + X(e.e / E), l = d.length, u = f.length, l < u && (o = d, d = f, f = o, s = l, l = u, u = s), o = [], s = l + u, n = s; n--; ) o.push(0);
      for (n = u; --n >= 0; ) {
        for (r = 0, i = l + n; i > n; ) a = o[i] + f[n] * d[i - n - 1] + r, o[i--] = a % fe | 0, r = a / fe | 0;
        o[i] = (o[i] + r) % fe | 0;
      }
      for (; !o[--s]; ) o.pop();
      return r ? ++t : o.shift(), e.d = o, e.e = wn(o, t), w ? y(e, p.precision, p.rounding) : e;
    };
    m.toBinary = function(e, r) {
      return Ji(this, 2, e, r);
    };
    m.toDecimalPlaces = m.toDP = function(e, r) {
      var t = this, n = t.constructor;
      return t = new n(t), e === void 0 ? t : (ne(e, 0, Ye), r === void 0 ? r = n.rounding : ne(r, 0, 8), y(t, e + t.e + 1, r));
    };
    m.toExponential = function(e, r) {
      var t, n = this, i = n.constructor;
      return e === void 0 ? t = ve(n, true) : (ne(e, 0, Ye), r === void 0 ? r = i.rounding : ne(r, 0, 8), n = y(new i(n), e + 1, r), t = ve(n, true, e + 1)), n.isNeg() && !n.isZero() ? "-" + t : t;
    };
    m.toFixed = function(e, r) {
      var t, n, i = this, o = i.constructor;
      return e === void 0 ? t = ve(i) : (ne(e, 0, Ye), r === void 0 ? r = o.rounding : ne(r, 0, 8), n = y(new o(i), e + i.e + 1, r), t = ve(n, false, e + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + t : t;
    };
    m.toFraction = function(e) {
      var r, t, n, i, o, s, a, l, u, c, p, d, f = this, h = f.d, g = f.constructor;
      if (!h) return new g(f);
      if (u = t = new g(1), n = l = new g(0), r = new g(n), o = r.e = Us(h) - f.e - 1, s = o % E, r.d[0] = U(10, s < 0 ? E + s : s), e == null) e = o > 0 ? r : u;
      else {
        if (a = new g(e), !a.isInt() || a.lt(u)) throw Error(He + a);
        e = a.gt(r) ? o > 0 ? r : u : a;
      }
      for (w = false, a = new g(J(h)), c = g.precision, g.precision = o = h.length * E * 2; p = L(a, r, 0, 1, 1), i = t.plus(p.times(n)), i.cmp(e) != 1; ) t = n, n = i, i = u, u = l.plus(p.times(i)), l = i, i = r, r = a.minus(p.times(i)), a = i;
      return i = L(e.minus(t), n, 0, 1, 1), l = l.plus(i.times(u)), t = t.plus(i.times(n)), l.s = u.s = f.s, d = L(u, n, o, 1).minus(f).abs().cmp(L(l, t, o, 1).minus(f).abs()) < 1 ? [u, n] : [l, t], g.precision = c, w = true, d;
    };
    m.toHexadecimal = m.toHex = function(e, r) {
      return Ji(this, 16, e, r);
    };
    m.toNearest = function(e, r) {
      var t = this, n = t.constructor;
      if (t = new n(t), e == null) {
        if (!t.d) return t;
        e = new n(1), r = n.rounding;
      } else {
        if (e = new n(e), r === void 0 ? r = n.rounding : ne(r, 0, 8), !t.d) return e.s ? t : e;
        if (!e.d) return e.s && (e.s = t.s), e;
      }
      return e.d[0] ? (w = false, t = L(t, e, 0, r, 1).times(e), w = true, y(t)) : (e.s = t.s, t = e), t;
    };
    m.toNumber = function() {
      return +this;
    };
    m.toOctal = function(e, r) {
      return Ji(this, 8, e, r);
    };
    m.toPower = m.pow = function(e) {
      var r, t, n, i, o, s, a = this, l = a.constructor, u = +(e = new l(e));
      if (!a.d || !e.d || !a.d[0] || !e.d[0]) return new l(U(+a, u));
      if (a = new l(a), a.eq(1)) return a;
      if (n = l.precision, o = l.rounding, e.eq(1)) return y(a, n, o);
      if (r = X(e.e / E), r >= e.d.length - 1 && (t = u < 0 ? -u : u) <= xp) return i = Gs(l, a, t, n), e.s < 0 ? new l(1).div(i) : y(i, n, o);
      if (s = a.s, s < 0) {
        if (r < e.d.length - 1) return new l(NaN);
        if ((e.d[r] & 1) == 0 && (s = 1), a.e == 0 && a.d[0] == 1 && a.d.length == 1) return a.s = s, a;
      }
      return t = U(+a, u), r = t == 0 || !isFinite(t) ? X(u * (Math.log("0." + J(a.d)) / Math.LN10 + a.e + 1)) : new l(t + "").e, r > l.maxE + 1 || r < l.minE - 1 ? new l(r > 0 ? s / 0 : 0) : (w = false, l.rounding = a.s = 1, t = Math.min(12, (r + "").length), i = Wi(e.times(Ke(a, n + t)), n), i.d && (i = y(i, n + 5, 1), ut(i.d, n, o) && (r = n + 10, i = y(Wi(e.times(Ke(a, r + t)), r), r + 5, 1), +J(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = y(i, n + 1, 0)))), i.s = s, w = true, l.rounding = o, y(i, n, o));
    };
    m.toPrecision = function(e, r) {
      var t, n = this, i = n.constructor;
      return e === void 0 ? t = ve(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (ne(e, 1, Ye), r === void 0 ? r = i.rounding : ne(r, 0, 8), n = y(new i(n), e, r), t = ve(n, e <= n.e || n.e <= i.toExpNeg, e)), n.isNeg() && !n.isZero() ? "-" + t : t;
    };
    m.toSignificantDigits = m.toSD = function(e, r) {
      var t = this, n = t.constructor;
      return e === void 0 ? (e = n.precision, r = n.rounding) : (ne(e, 1, Ye), r === void 0 ? r = n.rounding : ne(r, 0, 8)), y(new n(t), e, r);
    };
    m.toString = function() {
      var e = this, r = e.constructor, t = ve(e, e.e <= r.toExpNeg || e.e >= r.toExpPos);
      return e.isNeg() && !e.isZero() ? "-" + t : t;
    };
    m.truncated = m.trunc = function() {
      return y(new this.constructor(this), this.e + 1, 1);
    };
    m.valueOf = m.toJSON = function() {
      var e = this, r = e.constructor, t = ve(e, e.e <= r.toExpNeg || e.e >= r.toExpPos);
      return e.isNeg() ? "-" + t : t;
    };
    function J(e) {
      var r, t, n, i = e.length - 1, o = "", s = e[0];
      if (i > 0) {
        for (o += s, r = 1; r < i; r++) n = e[r] + "", t = E - n.length, t && (o += Je(t)), o += n;
        s = e[r], n = s + "", t = E - n.length, t && (o += Je(t));
      } else if (s === 0) return "0";
      for (; s % 10 === 0; ) s /= 10;
      return o + s;
    }
    __name(J, "J");
    function ne(e, r, t) {
      if (e !== ~~e || e < r || e > t) throw Error(He + e);
    }
    __name(ne, "ne");
    function ut(e, r, t, n) {
      var i, o, s, a;
      for (o = e[0]; o >= 10; o /= 10) --r;
      return --r < 0 ? (r += E, i = 0) : (i = Math.ceil((r + 1) / E), r %= E), o = U(10, E - r), a = e[i] % o | 0, n == null ? r < 3 ? (r == 0 ? a = a / 100 | 0 : r == 1 && (a = a / 10 | 0), s = t < 4 && a == 99999 || t > 3 && a == 49999 || a == 5e4 || a == 0) : s = (t < 4 && a + 1 == o || t > 3 && a + 1 == o / 2) && (e[i + 1] / o / 100 | 0) == U(10, r - 2) - 1 || (a == o / 2 || a == 0) && (e[i + 1] / o / 100 | 0) == 0 : r < 4 ? (r == 0 ? a = a / 1e3 | 0 : r == 1 ? a = a / 100 | 0 : r == 2 && (a = a / 10 | 0), s = (n || t < 4) && a == 9999 || !n && t > 3 && a == 4999) : s = ((n || t < 4) && a + 1 == o || !n && t > 3 && a + 1 == o / 2) && (e[i + 1] / o / 1e3 | 0) == U(10, r - 3) - 1, s;
    }
    __name(ut, "ut");
    function fn(e, r, t) {
      for (var n, i = [0], o, s = 0, a = e.length; s < a; ) {
        for (o = i.length; o--; ) i[o] *= r;
        for (i[0] += Ui.indexOf(e.charAt(s++)), n = 0; n < i.length; n++) i[n] > t - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / t | 0, i[n] %= t);
      }
      return i.reverse();
    }
    __name(fn, "fn");
    function Pp(e, r) {
      var t, n, i;
      if (r.isZero()) return r;
      n = r.d.length, n < 32 ? (t = Math.ceil(n / 3), i = (1 / xn(4, t)).toString()) : (t = 16, i = "2.3283064365386962890625e-10"), e.precision += t, r = Tr(e, 1, r.times(i), new e(1));
      for (var o = t; o--; ) {
        var s = r.times(r);
        r = s.times(s).minus(s).times(8).plus(1);
      }
      return e.precision -= t, r;
    }
    __name(Pp, "Pp");
    var L = /* @__PURE__ */ function() {
      function e(n, i, o) {
        var s, a = 0, l = n.length;
        for (n = n.slice(); l--; ) s = n[l] * i + a, n[l] = s % o | 0, a = s / o | 0;
        return a && n.unshift(a), n;
      }
      __name(e, "e");
      function r(n, i, o, s) {
        var a, l;
        if (o != s) l = o > s ? 1 : -1;
        else for (a = l = 0; a < o; a++) if (n[a] != i[a]) {
          l = n[a] > i[a] ? 1 : -1;
          break;
        }
        return l;
      }
      __name(r, "r");
      function t(n, i, o, s) {
        for (var a = 0; o--; ) n[o] -= a, a = n[o] < i[o] ? 1 : 0, n[o] = a * s + n[o] - i[o];
        for (; !n[0] && n.length > 1; ) n.shift();
      }
      __name(t, "t");
      return function(n, i, o, s, a, l) {
        var u, c, p, d, f, h, g, I, T, S, b, D, me, se, Kr, j, te, Ae, K, fr, Vt = n.constructor, ti = n.s == i.s ? 1 : -1, H = n.d, k = i.d;
        if (!H || !H[0] || !k || !k[0]) return new Vt(!n.s || !i.s || (H ? k && H[0] == k[0] : !k) ? NaN : H && H[0] == 0 || !k ? ti * 0 : ti / 0);
        for (l ? (f = 1, c = n.e - i.e) : (l = fe, f = E, c = X(n.e / f) - X(i.e / f)), K = k.length, te = H.length, T = new Vt(ti), S = T.d = [], p = 0; k[p] == (H[p] || 0); p++) ;
        if (k[p] > (H[p] || 0) && c--, o == null ? (se = o = Vt.precision, s = Vt.rounding) : a ? se = o + (n.e - i.e) + 1 : se = o, se < 0) S.push(1), h = true;
        else {
          if (se = se / f + 2 | 0, p = 0, K == 1) {
            for (d = 0, k = k[0], se++; (p < te || d) && se--; p++) Kr = d * l + (H[p] || 0), S[p] = Kr / k | 0, d = Kr % k | 0;
            h = d || p < te;
          } else {
            for (d = l / (k[0] + 1) | 0, d > 1 && (k = e(k, d, l), H = e(H, d, l), K = k.length, te = H.length), j = K, b = H.slice(0, K), D = b.length; D < K; ) b[D++] = 0;
            fr = k.slice(), fr.unshift(0), Ae = k[0], k[1] >= l / 2 && ++Ae;
            do
              d = 0, u = r(k, b, K, D), u < 0 ? (me = b[0], K != D && (me = me * l + (b[1] || 0)), d = me / Ae | 0, d > 1 ? (d >= l && (d = l - 1), g = e(k, d, l), I = g.length, D = b.length, u = r(g, b, I, D), u == 1 && (d--, t(g, K < I ? fr : k, I, l))) : (d == 0 && (u = d = 1), g = k.slice()), I = g.length, I < D && g.unshift(0), t(b, g, D, l), u == -1 && (D = b.length, u = r(k, b, K, D), u < 1 && (d++, t(b, K < D ? fr : k, D, l))), D = b.length) : u === 0 && (d++, b = [0]), S[p++] = d, u && b[0] ? b[D++] = H[j] || 0 : (b = [H[j]], D = 1);
            while ((j++ < te || b[0] !== void 0) && se--);
            h = b[0] !== void 0;
          }
          S[0] || S.shift();
        }
        if (f == 1) T.e = c, $s = h;
        else {
          for (p = 1, d = S[0]; d >= 10; d /= 10) p++;
          T.e = p + c * f - 1, y(T, a ? o + T.e + 1 : o, s, h);
        }
        return T;
      };
    }();
    function y(e, r, t, n) {
      var i, o, s, a, l, u, c, p, d, f = e.constructor;
      e: if (r != null) {
        if (p = e.d, !p) return e;
        for (i = 1, a = p[0]; a >= 10; a /= 10) i++;
        if (o = r - i, o < 0) o += E, s = r, c = p[d = 0], l = c / U(10, i - s - 1) % 10 | 0;
        else if (d = Math.ceil((o + 1) / E), a = p.length, d >= a) if (n) {
          for (; a++ <= d; ) p.push(0);
          c = l = 0, i = 1, o %= E, s = o - E + 1;
        } else break e;
        else {
          for (c = a = p[d], i = 1; a >= 10; a /= 10) i++;
          o %= E, s = o - E + i, l = s < 0 ? 0 : c / U(10, i - s - 1) % 10 | 0;
        }
        if (n = n || r < 0 || p[d + 1] !== void 0 || (s < 0 ? c : c % U(10, i - s - 1)), u = t < 4 ? (l || n) && (t == 0 || t == (e.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (t == 4 || n || t == 6 && (o > 0 ? s > 0 ? c / U(10, i - s) : 0 : p[d - 1]) % 10 & 1 || t == (e.s < 0 ? 8 : 7)), r < 1 || !p[0]) return p.length = 0, u ? (r -= e.e + 1, p[0] = U(10, (E - r % E) % E), e.e = -r || 0) : p[0] = e.e = 0, e;
        if (o == 0 ? (p.length = d, a = 1, d--) : (p.length = d + 1, a = U(10, E - o), p[d] = s > 0 ? (c / U(10, i - s) % U(10, s) | 0) * a : 0), u) for (; ; ) if (d == 0) {
          for (o = 1, s = p[0]; s >= 10; s /= 10) o++;
          for (s = p[0] += a, a = 1; s >= 10; s /= 10) a++;
          o != a && (e.e++, p[0] == fe && (p[0] = 1));
          break;
        } else {
          if (p[d] += a, p[d] != fe) break;
          p[d--] = 0, a = 1;
        }
        for (o = p.length; p[--o] === 0; ) p.pop();
      }
      return w && (e.e > f.maxE ? (e.d = null, e.e = NaN) : e.e < f.minE && (e.e = 0, e.d = [0])), e;
    }
    __name(y, "y");
    function ve(e, r, t) {
      if (!e.isFinite()) return Ws(e);
      var n, i = e.e, o = J(e.d), s = o.length;
      return r ? (t && (n = t - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + Je(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (e.e < 0 ? "e" : "e+") + e.e) : i < 0 ? (o = "0." + Je(-i - 1) + o, t && (n = t - s) > 0 && (o += Je(n))) : i >= s ? (o += Je(i + 1 - s), t && (n = t - i - 1) > 0 && (o = o + "." + Je(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), t && (n = t - s) > 0 && (i + 1 === s && (o += "."), o += Je(n))), o;
    }
    __name(ve, "ve");
    function wn(e, r) {
      var t = e[0];
      for (r *= E; t >= 10; t /= 10) r++;
      return r;
    }
    __name(wn, "wn");
    function bn(e, r, t) {
      if (r > vp) throw w = true, t && (e.precision = t), Error(qs);
      return y(new e(hn), r, 1, true);
    }
    __name(bn, "bn");
    function xe(e, r, t) {
      if (r > Qi) throw Error(qs);
      return y(new e(yn), r, t, true);
    }
    __name(xe, "xe");
    function Us(e) {
      var r = e.length - 1, t = r * E + 1;
      if (r = e[r], r) {
        for (; r % 10 == 0; r /= 10) t--;
        for (r = e[0]; r >= 10; r /= 10) t++;
      }
      return t;
    }
    __name(Us, "Us");
    function Je(e) {
      for (var r = ""; e--; ) r += "0";
      return r;
    }
    __name(Je, "Je");
    function Gs(e, r, t, n) {
      var i, o = new e(1), s = Math.ceil(n / E + 4);
      for (w = false; ; ) {
        if (t % 2 && (o = o.times(r), Fs(o.d, s) && (i = true)), t = X(t / 2), t === 0) {
          t = o.d.length - 1, i && o.d[t] === 0 && ++o.d[t];
          break;
        }
        r = r.times(r), Fs(r.d, s);
      }
      return w = true, o;
    }
    __name(Gs, "Gs");
    function Ls(e) {
      return e.d[e.d.length - 1] & 1;
    }
    __name(Ls, "Ls");
    function Qs(e, r, t) {
      for (var n, i, o = new e(r[0]), s = 0; ++s < r.length; ) {
        if (i = new e(r[s]), !i.s) {
          o = i;
          break;
        }
        n = o.cmp(i), (n === t || n === 0 && o.s === t) && (o = i);
      }
      return o;
    }
    __name(Qs, "Qs");
    function Wi(e, r) {
      var t, n, i, o, s, a, l, u = 0, c = 0, p = 0, d = e.constructor, f = d.rounding, h = d.precision;
      if (!e.d || !e.d[0] || e.e > 17) return new d(e.d ? e.d[0] ? e.s < 0 ? 0 : 1 / 0 : 1 : e.s ? e.s < 0 ? 0 : e : NaN);
      for (r == null ? (w = false, l = h) : l = r, a = new d(0.03125); e.e > -2; ) e = e.times(a), p += 5;
      for (n = Math.log(U(2, p)) / Math.LN10 * 2 + 5 | 0, l += n, t = o = s = new d(1), d.precision = l; ; ) {
        if (o = y(o.times(e), l, 1), t = t.times(++c), a = s.plus(L(o, t, l, 1)), J(a.d).slice(0, l) === J(s.d).slice(0, l)) {
          for (i = p; i--; ) s = y(s.times(s), l, 1);
          if (r == null) if (u < 3 && ut(s.d, l - n, f, u)) d.precision = l += 10, t = o = a = new d(1), c = 0, u++;
          else return y(s, d.precision = h, f, w = true);
          else return d.precision = h, s;
        }
        s = a;
      }
    }
    __name(Wi, "Wi");
    function Ke(e, r) {
      var t, n, i, o, s, a, l, u, c, p, d, f = 1, h = 10, g = e, I = g.d, T = g.constructor, S = T.rounding, b = T.precision;
      if (g.s < 0 || !I || !I[0] || !g.e && I[0] == 1 && I.length == 1) return new T(I && !I[0] ? -1 / 0 : g.s != 1 ? NaN : I ? 0 : g);
      if (r == null ? (w = false, c = b) : c = r, T.precision = c += h, t = J(I), n = t.charAt(0), Math.abs(o = g.e) < 15e14) {
        for (; n < 7 && n != 1 || n == 1 && t.charAt(1) > 3; ) g = g.times(e), t = J(g.d), n = t.charAt(0), f++;
        o = g.e, n > 1 ? (g = new T("0." + t), o++) : g = new T(n + "." + t.slice(1));
      } else return u = bn(T, c + 2, b).times(o + ""), g = Ke(new T(n + "." + t.slice(1)), c - h).plus(u), T.precision = b, r == null ? y(g, b, S, w = true) : g;
      for (p = g, l = s = g = L(g.minus(1), g.plus(1), c, 1), d = y(g.times(g), c, 1), i = 3; ; ) {
        if (s = y(s.times(d), c, 1), u = l.plus(L(s, new T(i), c, 1)), J(u.d).slice(0, c) === J(l.d).slice(0, c)) if (l = l.times(2), o !== 0 && (l = l.plus(bn(T, c + 2, b).times(o + ""))), l = L(l, new T(f), c, 1), r == null) if (ut(l.d, c - h, S, a)) T.precision = c += h, u = s = g = L(p.minus(1), p.plus(1), c, 1), d = y(g.times(g), c, 1), i = a = 1;
        else return y(l, T.precision = b, S, w = true);
        else return T.precision = b, l;
        l = u, i += 2;
      }
    }
    __name(Ke, "Ke");
    function Ws(e) {
      return String(e.s * e.s / 0);
    }
    __name(Ws, "Ws");
    function gn(e, r) {
      var t, n, i;
      for ((t = r.indexOf(".")) > -1 && (r = r.replace(".", "")), (n = r.search(/e/i)) > 0 ? (t < 0 && (t = n), t += +r.slice(n + 1), r = r.substring(0, n)) : t < 0 && (t = r.length), n = 0; r.charCodeAt(n) === 48; n++) ;
      for (i = r.length; r.charCodeAt(i - 1) === 48; --i) ;
      if (r = r.slice(n, i), r) {
        if (i -= n, e.e = t = t - n - 1, e.d = [], n = (t + 1) % E, t < 0 && (n += E), n < i) {
          for (n && e.d.push(+r.slice(0, n)), i -= E; n < i; ) e.d.push(+r.slice(n, n += E));
          r = r.slice(n), n = E - r.length;
        } else n -= i;
        for (; n--; ) r += "0";
        e.d.push(+r), w && (e.e > e.constructor.maxE ? (e.d = null, e.e = NaN) : e.e < e.constructor.minE && (e.e = 0, e.d = [0]));
      } else e.e = 0, e.d = [0];
      return e;
    }
    __name(gn, "gn");
    function Tp(e, r) {
      var t, n, i, o, s, a, l, u, c;
      if (r.indexOf("_") > -1) {
        if (r = r.replace(/(\d)_(?=\d)/g, "$1"), Bs.test(r)) return gn(e, r);
      } else if (r === "Infinity" || r === "NaN") return +r || (e.s = NaN), e.e = NaN, e.d = null, e;
      if (Ep.test(r)) t = 16, r = r.toLowerCase();
      else if (bp.test(r)) t = 2;
      else if (wp.test(r)) t = 8;
      else throw Error(He + r);
      for (o = r.search(/p/i), o > 0 ? (l = +r.slice(o + 1), r = r.substring(2, o)) : r = r.slice(2), o = r.indexOf("."), s = o >= 0, n = e.constructor, s && (r = r.replace(".", ""), a = r.length, o = a - o, i = Gs(n, new n(t), o, o * 2)), u = fn(r, t, fe), c = u.length - 1, o = c; u[o] === 0; --o) u.pop();
      return o < 0 ? new n(e.s * 0) : (e.e = wn(u, c), e.d = u, w = false, s && (e = L(e, i, a * 4)), l && (e = e.times(Math.abs(l) < 54 ? U(2, l) : Le.pow(2, l))), w = true, e);
    }
    __name(Tp, "Tp");
    function Sp(e, r) {
      var t, n = r.d.length;
      if (n < 3) return r.isZero() ? r : Tr(e, 2, r, r);
      t = 1.4 * Math.sqrt(n), t = t > 16 ? 16 : t | 0, r = r.times(1 / xn(5, t)), r = Tr(e, 2, r, r);
      for (var i, o = new e(5), s = new e(16), a = new e(20); t--; ) i = r.times(r), r = r.times(o.plus(i.times(s.times(i).minus(a))));
      return r;
    }
    __name(Sp, "Sp");
    function Tr(e, r, t, n, i) {
      var o, s, a, l, u = 1, c = e.precision, p = Math.ceil(c / E);
      for (w = false, l = t.times(t), a = new e(n); ; ) {
        if (s = L(a.times(l), new e(r++ * r++), c, 1), a = i ? n.plus(s) : n.minus(s), n = L(s.times(l), new e(r++ * r++), c, 1), s = a.plus(n), s.d[p] !== void 0) {
          for (o = p; s.d[o] === a.d[o] && o--; ) ;
          if (o == -1) break;
        }
        o = a, a = n, n = s, s = o, u++;
      }
      return w = true, s.d.length = p + 1, s;
    }
    __name(Tr, "Tr");
    function xn(e, r) {
      for (var t = e; --r; ) t *= e;
      return t;
    }
    __name(xn, "xn");
    function Js(e, r) {
      var t, n = r.s < 0, i = xe(e, e.precision, 1), o = i.times(0.5);
      if (r = r.abs(), r.lte(o)) return Ne = n ? 4 : 1, r;
      if (t = r.divToInt(i), t.isZero()) Ne = n ? 3 : 2;
      else {
        if (r = r.minus(t.times(i)), r.lte(o)) return Ne = Ls(t) ? n ? 2 : 3 : n ? 4 : 1, r;
        Ne = Ls(t) ? n ? 1 : 4 : n ? 3 : 2;
      }
      return r.minus(i).abs();
    }
    __name(Js, "Js");
    function Ji(e, r, t, n) {
      var i, o, s, a, l, u, c, p, d, f = e.constructor, h = t !== void 0;
      if (h ? (ne(t, 1, Ye), n === void 0 ? n = f.rounding : ne(n, 0, 8)) : (t = f.precision, n = f.rounding), !e.isFinite()) c = Ws(e);
      else {
        for (c = ve(e), s = c.indexOf("."), h ? (i = 2, r == 16 ? t = t * 4 - 3 : r == 8 && (t = t * 3 - 2)) : i = r, s >= 0 && (c = c.replace(".", ""), d = new f(1), d.e = c.length - s, d.d = fn(ve(d), 10, i), d.e = d.d.length), p = fn(c, 10, i), o = l = p.length; p[--l] == 0; ) p.pop();
        if (!p[0]) c = h ? "0p+0" : "0";
        else {
          if (s < 0 ? o-- : (e = new f(e), e.d = p, e.e = o, e = L(e, d, t, n, 0, i), p = e.d, o = e.e, u = $s), s = p[t], a = i / 2, u = u || p[t + 1] !== void 0, u = n < 4 ? (s !== void 0 || u) && (n === 0 || n === (e.s < 0 ? 3 : 2)) : s > a || s === a && (n === 4 || u || n === 6 && p[t - 1] & 1 || n === (e.s < 0 ? 8 : 7)), p.length = t, u) for (; ++p[--t] > i - 1; ) p[t] = 0, t || (++o, p.unshift(1));
          for (l = p.length; !p[l - 1]; --l) ;
          for (s = 0, c = ""; s < l; s++) c += Ui.charAt(p[s]);
          if (h) {
            if (l > 1) if (r == 16 || r == 8) {
              for (s = r == 16 ? 4 : 3, --l; l % s; l++) c += "0";
              for (p = fn(c, i, r), l = p.length; !p[l - 1]; --l) ;
              for (s = 1, c = "1."; s < l; s++) c += Ui.charAt(p[s]);
            } else c = c.charAt(0) + "." + c.slice(1);
            c = c + (o < 0 ? "p" : "p+") + o;
          } else if (o < 0) {
            for (; ++o; ) c = "0" + c;
            c = "0." + c;
          } else if (++o > l) for (o -= l; o--; ) c += "0";
          else o < l && (c = c.slice(0, o) + "." + c.slice(o));
        }
        c = (r == 16 ? "0x" : r == 2 ? "0b" : r == 8 ? "0o" : "") + c;
      }
      return e.s < 0 ? "-" + c : c;
    }
    __name(Ji, "Ji");
    function Fs(e, r) {
      if (e.length > r) return e.length = r, true;
    }
    __name(Fs, "Fs");
    function Rp(e) {
      return new this(e).abs();
    }
    __name(Rp, "Rp");
    function Ap(e) {
      return new this(e).acos();
    }
    __name(Ap, "Ap");
    function Cp(e) {
      return new this(e).acosh();
    }
    __name(Cp, "Cp");
    function Ip(e, r) {
      return new this(e).plus(r);
    }
    __name(Ip, "Ip");
    function Dp(e) {
      return new this(e).asin();
    }
    __name(Dp, "Dp");
    function Op(e) {
      return new this(e).asinh();
    }
    __name(Op, "Op");
    function kp(e) {
      return new this(e).atan();
    }
    __name(kp, "kp");
    function _p(e) {
      return new this(e).atanh();
    }
    __name(_p, "_p");
    function Np(e, r) {
      e = new this(e), r = new this(r);
      var t, n = this.precision, i = this.rounding, o = n + 4;
      return !e.s || !r.s ? t = new this(NaN) : !e.d && !r.d ? (t = xe(this, o, 1).times(r.s > 0 ? 0.25 : 0.75), t.s = e.s) : !r.d || e.isZero() ? (t = r.s < 0 ? xe(this, n, i) : new this(0), t.s = e.s) : !e.d || r.isZero() ? (t = xe(this, o, 1).times(0.5), t.s = e.s) : r.s < 0 ? (this.precision = o, this.rounding = 1, t = this.atan(L(e, r, o, 1)), r = xe(this, o, 1), this.precision = n, this.rounding = i, t = e.s < 0 ? t.minus(r) : t.plus(r)) : t = this.atan(L(e, r, o, 1)), t;
    }
    __name(Np, "Np");
    function Lp(e) {
      return new this(e).cbrt();
    }
    __name(Lp, "Lp");
    function Fp(e) {
      return y(e = new this(e), e.e + 1, 2);
    }
    __name(Fp, "Fp");
    function Mp(e, r, t) {
      return new this(e).clamp(r, t);
    }
    __name(Mp, "Mp");
    function $p(e) {
      if (!e || typeof e != "object") throw Error(En + "Object expected");
      var r, t, n, i = e.defaults === true, o = ["precision", 1, Ye, "rounding", 0, 8, "toExpNeg", -Pr, 0, "toExpPos", 0, Pr, "maxE", 0, Pr, "minE", -Pr, 0, "modulo", 0, 9];
      for (r = 0; r < o.length; r += 3) if (t = o[r], i && (this[t] = Gi[t]), (n = e[t]) !== void 0) if (X(n) === n && n >= o[r + 1] && n <= o[r + 2]) this[t] = n;
      else throw Error(He + t + ": " + n);
      if (t = "crypto", i && (this[t] = Gi[t]), (n = e[t]) !== void 0) if (n === true || n === false || n === 0 || n === 1) if (n) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[t] = true;
      else throw Error(Vs);
      else this[t] = false;
      else throw Error(He + t + ": " + n);
      return this;
    }
    __name($p, "$p");
    function qp(e) {
      return new this(e).cos();
    }
    __name(qp, "qp");
    function Vp(e) {
      return new this(e).cosh();
    }
    __name(Vp, "Vp");
    function Ks(e) {
      var r, t, n;
      function i(o) {
        var s, a, l, u = this;
        if (!(u instanceof i)) return new i(o);
        if (u.constructor = i, Ms(o)) {
          u.s = o.s, w ? !o.d || o.e > i.maxE ? (u.e = NaN, u.d = null) : o.e < i.minE ? (u.e = 0, u.d = [0]) : (u.e = o.e, u.d = o.d.slice()) : (u.e = o.e, u.d = o.d ? o.d.slice() : o.d);
          return;
        }
        if (l = typeof o, l === "number") {
          if (o === 0) {
            u.s = 1 / o < 0 ? -1 : 1, u.e = 0, u.d = [0];
            return;
          }
          if (o < 0 ? (o = -o, u.s = -1) : u.s = 1, o === ~~o && o < 1e7) {
            for (s = 0, a = o; a >= 10; a /= 10) s++;
            w ? s > i.maxE ? (u.e = NaN, u.d = null) : s < i.minE ? (u.e = 0, u.d = [0]) : (u.e = s, u.d = [o]) : (u.e = s, u.d = [o]);
            return;
          }
          if (o * 0 !== 0) {
            o || (u.s = NaN), u.e = NaN, u.d = null;
            return;
          }
          return gn(u, o.toString());
        }
        if (l === "string") return (a = o.charCodeAt(0)) === 45 ? (o = o.slice(1), u.s = -1) : (a === 43 && (o = o.slice(1)), u.s = 1), Bs.test(o) ? gn(u, o) : Tp(u, o);
        if (l === "bigint") return o < 0 ? (o = -o, u.s = -1) : u.s = 1, gn(u, o.toString());
        throw Error(He + o);
      }
      __name(i, "i");
      if (i.prototype = m, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = $p, i.clone = Ks, i.isDecimal = Ms, i.abs = Rp, i.acos = Ap, i.acosh = Cp, i.add = Ip, i.asin = Dp, i.asinh = Op, i.atan = kp, i.atanh = _p, i.atan2 = Np, i.cbrt = Lp, i.ceil = Fp, i.clamp = Mp, i.cos = qp, i.cosh = Vp, i.div = jp, i.exp = Bp, i.floor = Up, i.hypot = Gp, i.ln = Qp, i.log = Wp, i.log10 = Kp, i.log2 = Jp, i.max = Hp, i.min = Yp, i.mod = zp, i.mul = Zp, i.pow = Xp, i.random = ed, i.round = rd, i.sign = td, i.sin = nd, i.sinh = id, i.sqrt = od, i.sub = sd, i.sum = ad, i.tan = ld, i.tanh = ud, i.trunc = cd, e === void 0 && (e = {}), e && e.defaults !== true) for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], r = 0; r < n.length; ) e.hasOwnProperty(t = n[r++]) || (e[t] = this[t]);
      return i.config(e), i;
    }
    __name(Ks, "Ks");
    function jp(e, r) {
      return new this(e).div(r);
    }
    __name(jp, "jp");
    function Bp(e) {
      return new this(e).exp();
    }
    __name(Bp, "Bp");
    function Up(e) {
      return y(e = new this(e), e.e + 1, 3);
    }
    __name(Up, "Up");
    function Gp() {
      var e, r, t = new this(0);
      for (w = false, e = 0; e < arguments.length; ) if (r = new this(arguments[e++]), r.d) t.d && (t = t.plus(r.times(r)));
      else {
        if (r.s) return w = true, new this(1 / 0);
        t = r;
      }
      return w = true, t.sqrt();
    }
    __name(Gp, "Gp");
    function Ms(e) {
      return e instanceof Le || e && e.toStringTag === js || false;
    }
    __name(Ms, "Ms");
    function Qp(e) {
      return new this(e).ln();
    }
    __name(Qp, "Qp");
    function Wp(e, r) {
      return new this(e).log(r);
    }
    __name(Wp, "Wp");
    function Jp(e) {
      return new this(e).log(2);
    }
    __name(Jp, "Jp");
    function Kp(e) {
      return new this(e).log(10);
    }
    __name(Kp, "Kp");
    function Hp() {
      return Qs(this, arguments, -1);
    }
    __name(Hp, "Hp");
    function Yp() {
      return Qs(this, arguments, 1);
    }
    __name(Yp, "Yp");
    function zp(e, r) {
      return new this(e).mod(r);
    }
    __name(zp, "zp");
    function Zp(e, r) {
      return new this(e).mul(r);
    }
    __name(Zp, "Zp");
    function Xp(e, r) {
      return new this(e).pow(r);
    }
    __name(Xp, "Xp");
    function ed(e) {
      var r, t, n, i, o = 0, s = new this(1), a = [];
      if (e === void 0 ? e = this.precision : ne(e, 1, Ye), n = Math.ceil(e / E), this.crypto) if (crypto.getRandomValues) for (r = crypto.getRandomValues(new Uint32Array(n)); o < n; ) i = r[o], i >= 429e7 ? r[o] = crypto.getRandomValues(new Uint32Array(1))[0] : a[o++] = i % 1e7;
      else if (crypto.randomBytes) {
        for (r = crypto.randomBytes(n *= 4); o < n; ) i = r[o] + (r[o + 1] << 8) + (r[o + 2] << 16) + ((r[o + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(r, o) : (a.push(i % 1e7), o += 4);
        o = n / 4;
      } else throw Error(Vs);
      else for (; o < n; ) a[o++] = Math.random() * 1e7 | 0;
      for (n = a[--o], e %= E, n && e && (i = U(10, E - e), a[o] = (n / i | 0) * i); a[o] === 0; o--) a.pop();
      if (o < 0) t = 0, a = [0];
      else {
        for (t = -1; a[0] === 0; t -= E) a.shift();
        for (n = 1, i = a[0]; i >= 10; i /= 10) n++;
        n < E && (t -= E - n);
      }
      return s.e = t, s.d = a, s;
    }
    __name(ed, "ed");
    function rd(e) {
      return y(e = new this(e), e.e + 1, this.rounding);
    }
    __name(rd, "rd");
    function td(e) {
      return e = new this(e), e.d ? e.d[0] ? e.s : 0 * e.s : e.s || NaN;
    }
    __name(td, "td");
    function nd(e) {
      return new this(e).sin();
    }
    __name(nd, "nd");
    function id(e) {
      return new this(e).sinh();
    }
    __name(id, "id");
    function od(e) {
      return new this(e).sqrt();
    }
    __name(od, "od");
    function sd(e, r) {
      return new this(e).sub(r);
    }
    __name(sd, "sd");
    function ad() {
      var e = 0, r = arguments, t = new this(r[e]);
      for (w = false; t.s && ++e < r.length; ) t = t.plus(r[e]);
      return w = true, y(t, this.precision, this.rounding);
    }
    __name(ad, "ad");
    function ld(e) {
      return new this(e).tan();
    }
    __name(ld, "ld");
    function ud(e) {
      return new this(e).tanh();
    }
    __name(ud, "ud");
    function cd(e) {
      return y(e = new this(e), e.e + 1, 1);
    }
    __name(cd, "cd");
    m[Symbol.for("nodejs.util.inspect.custom")] = m.toString;
    m[Symbol.toStringTag] = "Decimal";
    var Le = m.constructor = Ks(Gi);
    hn = new Le(hn);
    yn = new Le(yn);
    var Fe = Le;
    function Sr(e) {
      return Le.isDecimal(e) ? true : e !== null && typeof e == "object" && typeof e.s == "number" && typeof e.e == "number" && typeof e.toFixed == "function" && Array.isArray(e.d);
    }
    __name(Sr, "Sr");
    var ct = {};
    tr(ct, { ModelAction: /* @__PURE__ */ __name(() => Rr, "ModelAction"), datamodelEnumToSchemaEnum: /* @__PURE__ */ __name(() => pd, "datamodelEnumToSchemaEnum") });
    function pd(e) {
      return { name: e.name, values: e.values.map((r) => r.name) };
    }
    __name(pd, "pd");
    var Rr = ((b) => (b.findUnique = "findUnique", b.findUniqueOrThrow = "findUniqueOrThrow", b.findFirst = "findFirst", b.findFirstOrThrow = "findFirstOrThrow", b.findMany = "findMany", b.create = "create", b.createMany = "createMany", b.createManyAndReturn = "createManyAndReturn", b.update = "update", b.updateMany = "updateMany", b.updateManyAndReturn = "updateManyAndReturn", b.upsert = "upsert", b.delete = "delete", b.deleteMany = "deleteMany", b.groupBy = "groupBy", b.count = "count", b.aggregate = "aggregate", b.findRaw = "findRaw", b.aggregateRaw = "aggregateRaw", b))(Rr || {});
    var Xs = O(Di());
    var Zs = O(__require("node:fs"));
    var Hs = { keyword: De, entity: De, value: /* @__PURE__ */ __name((e) => W(nr(e)), "value"), punctuation: nr, directive: De, function: De, variable: /* @__PURE__ */ __name((e) => W(nr(e)), "variable"), string: /* @__PURE__ */ __name((e) => W(qe(e)), "string"), boolean: Ie, number: De, comment: Hr };
    var dd = /* @__PURE__ */ __name((e) => e, "dd");
    var vn = {};
    var md = 0;
    var v = { manual: vn.Prism && vn.Prism.manual, disableWorkerMessageHandler: vn.Prism && vn.Prism.disableWorkerMessageHandler, util: { encode: /* @__PURE__ */ __name(function(e) {
      if (e instanceof ge) {
        let r = e;
        return new ge(r.type, v.util.encode(r.content), r.alias);
      } else return Array.isArray(e) ? e.map(v.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
    }, "encode"), type: /* @__PURE__ */ __name(function(e) {
      return Object.prototype.toString.call(e).slice(8, -1);
    }, "type"), objId: /* @__PURE__ */ __name(function(e) {
      return e.__id || Object.defineProperty(e, "__id", { value: ++md }), e.__id;
    }, "objId"), clone: /* @__PURE__ */ __name(function e(r, t) {
      let n, i, o = v.util.type(r);
      switch (t = t || {}, o) {
        case "Object":
          if (i = v.util.objId(r), t[i]) return t[i];
          n = {}, t[i] = n;
          for (let s in r) r.hasOwnProperty(s) && (n[s] = e(r[s], t));
          return n;
        case "Array":
          return i = v.util.objId(r), t[i] ? t[i] : (n = [], t[i] = n, r.forEach(function(s, a) {
            n[a] = e(s, t);
          }), n);
        default:
          return r;
      }
    }, "e") }, languages: { extend: /* @__PURE__ */ __name(function(e, r) {
      let t = v.util.clone(v.languages[e]);
      for (let n in r) t[n] = r[n];
      return t;
    }, "extend"), insertBefore: /* @__PURE__ */ __name(function(e, r, t, n) {
      n = n || v.languages;
      let i = n[e], o = {};
      for (let a in i) if (i.hasOwnProperty(a)) {
        if (a == r) for (let l in t) t.hasOwnProperty(l) && (o[l] = t[l]);
        t.hasOwnProperty(a) || (o[a] = i[a]);
      }
      let s = n[e];
      return n[e] = o, v.languages.DFS(v.languages, function(a, l) {
        l === s && a != e && (this[a] = o);
      }), o;
    }, "insertBefore"), DFS: /* @__PURE__ */ __name(function e(r, t, n, i) {
      i = i || {};
      let o = v.util.objId;
      for (let s in r) if (r.hasOwnProperty(s)) {
        t.call(r, s, r[s], n || s);
        let a = r[s], l = v.util.type(a);
        l === "Object" && !i[o(a)] ? (i[o(a)] = true, e(a, t, null, i)) : l === "Array" && !i[o(a)] && (i[o(a)] = true, e(a, t, s, i));
      }
    }, "e") }, plugins: {}, highlight: /* @__PURE__ */ __name(function(e, r, t) {
      let n = { code: e, grammar: r, language: t };
      return v.hooks.run("before-tokenize", n), n.tokens = v.tokenize(n.code, n.grammar), v.hooks.run("after-tokenize", n), ge.stringify(v.util.encode(n.tokens), n.language);
    }, "highlight"), matchGrammar: /* @__PURE__ */ __name(function(e, r, t, n, i, o, s) {
      for (let g in t) {
        if (!t.hasOwnProperty(g) || !t[g]) continue;
        if (g == s) return;
        let I = t[g];
        I = v.util.type(I) === "Array" ? I : [I];
        for (let T = 0; T < I.length; ++T) {
          let S = I[T], b = S.inside, D = !!S.lookbehind, me = !!S.greedy, se = 0, Kr = S.alias;
          if (me && !S.pattern.global) {
            let j = S.pattern.toString().match(/[imuy]*$/)[0];
            S.pattern = RegExp(S.pattern.source, j + "g");
          }
          S = S.pattern || S;
          for (let j = n, te = i; j < r.length; te += r[j].length, ++j) {
            let Ae = r[j];
            if (r.length > e.length) return;
            if (Ae instanceof ge) continue;
            if (me && j != r.length - 1) {
              S.lastIndex = te;
              var p = S.exec(e);
              if (!p) break;
              var c = p.index + (D ? p[1].length : 0), d = p.index + p[0].length, a = j, l = te;
              for (let k = r.length; a < k && (l < d || !r[a].type && !r[a - 1].greedy); ++a) l += r[a].length, c >= l && (++j, te = l);
              if (r[j] instanceof ge) continue;
              u = a - j, Ae = e.slice(te, l), p.index -= te;
            } else {
              S.lastIndex = 0;
              var p = S.exec(Ae), u = 1;
            }
            if (!p) {
              if (o) break;
              continue;
            }
            D && (se = p[1] ? p[1].length : 0);
            var c = p.index + se, p = p[0].slice(se), d = c + p.length, f = Ae.slice(0, c), h = Ae.slice(d);
            let K = [j, u];
            f && (++j, te += f.length, K.push(f));
            let fr = new ge(g, b ? v.tokenize(p, b) : p, Kr, p, me);
            if (K.push(fr), h && K.push(h), Array.prototype.splice.apply(r, K), u != 1 && v.matchGrammar(e, r, t, j, te, true, g), o) break;
          }
        }
      }
    }, "matchGrammar"), tokenize: /* @__PURE__ */ __name(function(e, r) {
      let t = [e], n = r.rest;
      if (n) {
        for (let i in n) r[i] = n[i];
        delete r.rest;
      }
      return v.matchGrammar(e, t, r, 0, 0, false), t;
    }, "tokenize"), hooks: { all: {}, add: /* @__PURE__ */ __name(function(e, r) {
      let t = v.hooks.all;
      t[e] = t[e] || [], t[e].push(r);
    }, "add"), run: /* @__PURE__ */ __name(function(e, r) {
      let t = v.hooks.all[e];
      if (!(!t || !t.length)) for (var n = 0, i; i = t[n++]; ) i(r);
    }, "run") }, Token: ge };
    v.languages.clike = { comment: [{ pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/, lookbehind: true }, { pattern: /(^|[^\\:])\/\/.*/, lookbehind: true, greedy: true }], string: { pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true }, "class-name": { pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i, lookbehind: true, inside: { punctuation: /[.\\]/ } }, keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/, boolean: /\b(?:true|false)\b/, function: /\w+(?=\()/, number: /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i, operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/, punctuation: /[{}[\];(),.:]/ };
    v.languages.javascript = v.languages.extend("clike", { "class-name": [v.languages.clike["class-name"], { pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/, lookbehind: true }], keyword: [{ pattern: /((?:^|})\s*)(?:catch|finally)\b/, lookbehind: true }, { pattern: /(^|[^.])\b(?:as|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/, lookbehind: true }], number: /\b(?:(?:0[xX](?:[\dA-Fa-f](?:_[\dA-Fa-f])?)+|0[bB](?:[01](?:_[01])?)+|0[oO](?:[0-7](?:_[0-7])?)+)n?|(?:\d(?:_\d)?)+n|NaN|Infinity)\b|(?:\b(?:\d(?:_\d)?)+\.?(?:\d(?:_\d)?)*|\B\.(?:\d(?:_\d)?)+)(?:[Ee][+-]?(?:\d(?:_\d)?)+)?/, function: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/, operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/ });
    v.languages.javascript["class-name"][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/;
    v.languages.insertBefore("javascript", "keyword", { regex: { pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyus]{0,6}(?=\s*($|[\r\n,.;})\]]))/, lookbehind: true, greedy: true }, "function-variable": { pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/, alias: "function" }, parameter: [{ pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/, lookbehind: true, inside: v.languages.javascript }, { pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i, inside: v.languages.javascript }, { pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/, lookbehind: true, inside: v.languages.javascript }, { pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/, lookbehind: true, inside: v.languages.javascript }], constant: /\b[A-Z](?:[A-Z_]|\dx?)*\b/ });
    v.languages.markup && v.languages.markup.tag.addInlined("script", "javascript");
    v.languages.js = v.languages.javascript;
    v.languages.typescript = v.languages.extend("javascript", { keyword: /\b(?:abstract|as|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|is|keyof|let|module|namespace|new|null|of|package|private|protected|public|readonly|return|require|set|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/, builtin: /\b(?:string|Function|any|number|boolean|Array|symbol|console|Promise|unknown|never)\b/ });
    v.languages.ts = v.languages.typescript;
    function ge(e, r, t, n, i) {
      this.type = e, this.content = r, this.alias = t, this.length = (n || "").length | 0, this.greedy = !!i;
    }
    __name(ge, "ge");
    ge.stringify = function(e, r) {
      return typeof e == "string" ? e : Array.isArray(e) ? e.map(function(t) {
        return ge.stringify(t, r);
      }).join("") : fd(e.type)(e.content);
    };
    function fd(e) {
      return Hs[e] || dd;
    }
    __name(fd, "fd");
    function Ys(e) {
      return gd(e, v.languages.javascript);
    }
    __name(Ys, "Ys");
    function gd(e, r) {
      return v.tokenize(e, r).map((n) => ge.stringify(n)).join("");
    }
    __name(gd, "gd");
    function zs(e) {
      return Ci(e);
    }
    __name(zs, "zs");
    var Pn = class e {
      static {
        __name(this, "e");
      }
      firstLineNumber;
      lines;
      static read(r) {
        let t;
        try {
          t = Zs.default.readFileSync(r, "utf-8");
        } catch {
          return null;
        }
        return e.fromContent(t);
      }
      static fromContent(r) {
        let t = r.split(/\r?\n/);
        return new e(1, t);
      }
      constructor(r, t) {
        this.firstLineNumber = r, this.lines = t;
      }
      get lastLineNumber() {
        return this.firstLineNumber + this.lines.length - 1;
      }
      mapLineAt(r, t) {
        if (r < this.firstLineNumber || r > this.lines.length + this.firstLineNumber) return this;
        let n = r - this.firstLineNumber, i = [...this.lines];
        return i[n] = t(i[n]), new e(this.firstLineNumber, i);
      }
      mapLines(r) {
        return new e(this.firstLineNumber, this.lines.map((t, n) => r(t, this.firstLineNumber + n)));
      }
      lineAt(r) {
        return this.lines[r - this.firstLineNumber];
      }
      prependSymbolAt(r, t) {
        return this.mapLines((n, i) => i === r ? `${t} ${n}` : `  ${n}`);
      }
      slice(r, t) {
        let n = this.lines.slice(r - 1, t).join(`
`);
        return new e(r, zs(n).split(`
`));
      }
      highlight() {
        let r = Ys(this.toString());
        return new e(this.firstLineNumber, r.split(`
`));
      }
      toString() {
        return this.lines.join(`
`);
      }
    };
    var hd = { red: ce, gray: Hr, dim: Ce, bold: W, underline: Y, highlightSource: /* @__PURE__ */ __name((e) => e.highlight(), "highlightSource") };
    var yd = { red: /* @__PURE__ */ __name((e) => e, "red"), gray: /* @__PURE__ */ __name((e) => e, "gray"), dim: /* @__PURE__ */ __name((e) => e, "dim"), bold: /* @__PURE__ */ __name((e) => e, "bold"), underline: /* @__PURE__ */ __name((e) => e, "underline"), highlightSource: /* @__PURE__ */ __name((e) => e, "highlightSource") };
    function bd({ message: e, originalMethod: r, isPanic: t, callArguments: n }) {
      return { functionName: `prisma.${r}()`, message: e, isPanic: t ?? false, callArguments: n };
    }
    __name(bd, "bd");
    function Ed({ callsite: e, message: r, originalMethod: t, isPanic: n, callArguments: i }, o) {
      let s = bd({ message: r, originalMethod: t, isPanic: n, callArguments: i });
      if (!e || typeof window < "u" || process.env.NODE_ENV === "production") return s;
      let a = e.getLocation();
      if (!a || !a.lineNumber || !a.columnNumber) return s;
      let l = Math.max(1, a.lineNumber - 3), u = Pn.read(a.fileName)?.slice(l, a.lineNumber), c = u?.lineAt(a.lineNumber);
      if (u && c) {
        let p = xd(c), d = wd(c);
        if (!d) return s;
        s.functionName = `${d.code})`, s.location = a, n || (u = u.mapLineAt(a.lineNumber, (h) => h.slice(0, d.openingBraceIndex))), u = o.highlightSource(u);
        let f = String(u.lastLineNumber).length;
        if (s.contextLines = u.mapLines((h, g) => o.gray(String(g).padStart(f)) + " " + h).mapLines((h) => o.dim(h)).prependSymbolAt(a.lineNumber, o.bold(o.red("→"))), i) {
          let h = p + f + 1;
          h += 2, s.callArguments = (0, Xs.default)(i, h).slice(h);
        }
      }
      return s;
    }
    __name(Ed, "Ed");
    function wd(e) {
      let r = Object.keys(Rr).join("|"), n = new RegExp(String.raw`\.(${r})\(`).exec(e);
      if (n) {
        let i = n.index + n[0].length, o = e.lastIndexOf(" ", n.index) + 1;
        return { code: e.slice(o, i), openingBraceIndex: i };
      }
      return null;
    }
    __name(wd, "wd");
    function xd(e) {
      let r = 0;
      for (let t = 0; t < e.length; t++) {
        if (e.charAt(t) !== " ") return r;
        r++;
      }
      return r;
    }
    __name(xd, "xd");
    function vd({ functionName: e, location: r, message: t, isPanic: n, contextLines: i, callArguments: o }, s) {
      let a = [""], l = r ? " in" : ":";
      if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${e}\``)} invocation${l}`))) : a.push(s.red(`Invalid ${s.bold(`\`${e}\``)} invocation${l}`)), r && a.push(s.underline(Pd(r))), i) {
        a.push("");
        let u = [i.toString()];
        o && (u.push(o), u.push(s.dim(")"))), a.push(u.join("")), o && a.push("");
      } else a.push(""), o && a.push(o), a.push("");
      return a.push(t), a.join(`
`);
    }
    __name(vd, "vd");
    function Pd(e) {
      let r = [e.fileName];
      return e.lineNumber && r.push(String(e.lineNumber)), e.columnNumber && r.push(String(e.columnNumber)), r.join(":");
    }
    __name(Pd, "Pd");
    function Tn(e) {
      let r = e.showColors ? hd : yd, t;
      return t = Ed(e, r), vd(t, r);
    }
    __name(Tn, "Tn");
    var la = O(Ki());
    function na(e, r, t) {
      let n = ia(e), i = Td(n), o = Rd(i);
      o ? Sn(o, r, t) : r.addErrorMessage(() => "Unknown error");
    }
    __name(na, "na");
    function ia(e) {
      return e.errors.flatMap((r) => r.kind === "Union" ? ia(r) : [r]);
    }
    __name(ia, "ia");
    function Td(e) {
      let r = /* @__PURE__ */ new Map(), t = [];
      for (let n of e) {
        if (n.kind !== "InvalidArgumentType") {
          t.push(n);
          continue;
        }
        let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = r.get(i);
        o ? r.set(i, { ...n, argument: { ...n.argument, typeNames: Sd(o.argument.typeNames, n.argument.typeNames) } }) : r.set(i, n);
      }
      return t.push(...r.values()), t;
    }
    __name(Td, "Td");
    function Sd(e, r) {
      return [...new Set(e.concat(r))];
    }
    __name(Sd, "Sd");
    function Rd(e) {
      return ji(e, (r, t) => {
        let n = ra(r), i = ra(t);
        return n !== i ? n - i : ta(r) - ta(t);
      });
    }
    __name(Rd, "Rd");
    function ra(e) {
      let r = 0;
      return Array.isArray(e.selectionPath) && (r += e.selectionPath.length), Array.isArray(e.argumentPath) && (r += e.argumentPath.length), r;
    }
    __name(ra, "ra");
    function ta(e) {
      switch (e.kind) {
        case "InvalidArgumentValue":
        case "ValueTooLarge":
          return 20;
        case "InvalidArgumentType":
          return 10;
        case "RequiredArgumentMissing":
          return -10;
        default:
          return 0;
      }
    }
    __name(ta, "ta");
    var le = class {
      static {
        __name(this, "le");
      }
      constructor(r, t) {
        this.name = r;
        this.value = t;
      }
      isRequired = false;
      makeRequired() {
        return this.isRequired = true, this;
      }
      write(r) {
        let { colors: { green: t } } = r.context;
        r.addMarginSymbol(t(this.isRequired ? "+" : "?")), r.write(t(this.name)), this.isRequired || r.write(t("?")), r.write(t(": ")), typeof this.value == "string" ? r.write(t(this.value)) : r.write(this.value);
      }
    };
    sa();
    var Ar = class {
      static {
        __name(this, "Ar");
      }
      constructor(r = 0, t) {
        this.context = t;
        this.currentIndent = r;
      }
      lines = [];
      currentLine = "";
      currentIndent = 0;
      marginSymbol;
      afterNextNewLineCallback;
      write(r) {
        return typeof r == "string" ? this.currentLine += r : r.write(this), this;
      }
      writeJoined(r, t, n = (i, o) => o.write(i)) {
        let i = t.length - 1;
        for (let o = 0; o < t.length; o++) n(t[o], this), o !== i && this.write(r);
        return this;
      }
      writeLine(r) {
        return this.write(r).newLine();
      }
      newLine() {
        this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0;
        let r = this.afterNextNewLineCallback;
        return this.afterNextNewLineCallback = void 0, r?.(), this;
      }
      withIndent(r) {
        return this.indent(), r(this), this.unindent(), this;
      }
      afterNextNewline(r) {
        return this.afterNextNewLineCallback = r, this;
      }
      indent() {
        return this.currentIndent++, this;
      }
      unindent() {
        return this.currentIndent > 0 && this.currentIndent--, this;
      }
      addMarginSymbol(r) {
        return this.marginSymbol = r, this;
      }
      toString() {
        return this.lines.concat(this.indentedCurrentLine()).join(`
`);
      }
      getCurrentLineLength() {
        return this.currentLine.length;
      }
      indentedCurrentLine() {
        let r = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
        return this.marginSymbol ? this.marginSymbol + r.slice(1) : r;
      }
    };
    oa();
    var Rn = class {
      static {
        __name(this, "Rn");
      }
      constructor(r) {
        this.value = r;
      }
      write(r) {
        r.write(this.value);
      }
      markAsError() {
        this.value.markAsError();
      }
    };
    var An = /* @__PURE__ */ __name((e) => e, "An");
    var Cn = { bold: An, red: An, green: An, dim: An, enabled: false };
    var aa = { bold: W, red: ce, green: qe, dim: Ce, enabled: true };
    var Cr = { write(e) {
      e.writeLine(",");
    } };
    var Pe = class {
      static {
        __name(this, "Pe");
      }
      constructor(r) {
        this.contents = r;
      }
      isUnderlined = false;
      color = /* @__PURE__ */ __name((r) => r, "color");
      underline() {
        return this.isUnderlined = true, this;
      }
      setColor(r) {
        return this.color = r, this;
      }
      write(r) {
        let t = r.getCurrentLineLength();
        r.write(this.color(this.contents)), this.isUnderlined && r.afterNextNewline(() => {
          r.write(" ".repeat(t)).writeLine(this.color("~".repeat(this.contents.length)));
        });
      }
    };
    var ze = class {
      static {
        __name(this, "ze");
      }
      hasError = false;
      markAsError() {
        return this.hasError = true, this;
      }
    };
    var Ir = class extends ze {
      static {
        __name(this, "Ir");
      }
      items = [];
      addItem(r) {
        return this.items.push(new Rn(r)), this;
      }
      getField(r) {
        return this.items[r];
      }
      getPrintWidth() {
        return this.items.length === 0 ? 2 : Math.max(...this.items.map((t) => t.value.getPrintWidth())) + 2;
      }
      write(r) {
        if (this.items.length === 0) {
          this.writeEmpty(r);
          return;
        }
        this.writeWithItems(r);
      }
      writeEmpty(r) {
        let t = new Pe("[]");
        this.hasError && t.setColor(r.context.colors.red).underline(), r.write(t);
      }
      writeWithItems(r) {
        let { colors: t } = r.context;
        r.writeLine("[").withIndent(() => r.writeJoined(Cr, this.items).newLine()).write("]"), this.hasError && r.afterNextNewline(() => {
          r.writeLine(t.red("~".repeat(this.getPrintWidth())));
        });
      }
      asObject() {
      }
    };
    var Dr = class e extends ze {
      static {
        __name(this, "e");
      }
      fields = {};
      suggestions = [];
      addField(r) {
        this.fields[r.name] = r;
      }
      addSuggestion(r) {
        this.suggestions.push(r);
      }
      getField(r) {
        return this.fields[r];
      }
      getDeepField(r) {
        let [t, ...n] = r, i = this.getField(t);
        if (!i) return;
        let o = i;
        for (let s of n) {
          let a;
          if (o.value instanceof e ? a = o.value.getField(s) : o.value instanceof Ir && (a = o.value.getField(Number(s))), !a) return;
          o = a;
        }
        return o;
      }
      getDeepFieldValue(r) {
        return r.length === 0 ? this : this.getDeepField(r)?.value;
      }
      hasField(r) {
        return !!this.getField(r);
      }
      removeAllFields() {
        this.fields = {};
      }
      removeField(r) {
        delete this.fields[r];
      }
      getFields() {
        return this.fields;
      }
      isEmpty() {
        return Object.keys(this.fields).length === 0;
      }
      getFieldValue(r) {
        return this.getField(r)?.value;
      }
      getDeepSubSelectionValue(r) {
        let t = this;
        for (let n of r) {
          if (!(t instanceof e)) return;
          let i = t.getSubSelectionValue(n);
          if (!i) return;
          t = i;
        }
        return t;
      }
      getDeepSelectionParent(r) {
        let t = this.getSelectionParent();
        if (!t) return;
        let n = t;
        for (let i of r) {
          let o = n.value.getFieldValue(i);
          if (!o || !(o instanceof e)) return;
          let s = o.getSelectionParent();
          if (!s) return;
          n = s;
        }
        return n;
      }
      getSelectionParent() {
        let r = this.getField("select")?.value.asObject();
        if (r) return { kind: "select", value: r };
        let t = this.getField("include")?.value.asObject();
        if (t) return { kind: "include", value: t };
      }
      getSubSelectionValue(r) {
        return this.getSelectionParent()?.value.fields[r].value;
      }
      getPrintWidth() {
        let r = Object.values(this.fields);
        return r.length == 0 ? 2 : Math.max(...r.map((n) => n.getPrintWidth())) + 2;
      }
      write(r) {
        let t = Object.values(this.fields);
        if (t.length === 0 && this.suggestions.length === 0) {
          this.writeEmpty(r);
          return;
        }
        this.writeWithContents(r, t);
      }
      asObject() {
        return this;
      }
      writeEmpty(r) {
        let t = new Pe("{}");
        this.hasError && t.setColor(r.context.colors.red).underline(), r.write(t);
      }
      writeWithContents(r, t) {
        r.writeLine("{").withIndent(() => {
          r.writeJoined(Cr, [...t, ...this.suggestions]).newLine();
        }), r.write("}"), this.hasError && r.afterNextNewline(() => {
          r.writeLine(r.context.colors.red("~".repeat(this.getPrintWidth())));
        });
      }
    };
    var Q = class extends ze {
      static {
        __name(this, "Q");
      }
      constructor(t) {
        super();
        this.text = t;
      }
      getPrintWidth() {
        return this.text.length;
      }
      write(t) {
        let n = new Pe(this.text);
        this.hasError && n.underline().setColor(t.context.colors.red), t.write(n);
      }
      asObject() {
      }
    };
    var pt = class {
      static {
        __name(this, "pt");
      }
      fields = [];
      addField(r, t) {
        return this.fields.push({ write(n) {
          let { green: i, dim: o } = n.context.colors;
          n.write(i(o(`${r}: ${t}`))).addMarginSymbol(i(o("+")));
        } }), this;
      }
      write(r) {
        let { colors: { green: t } } = r.context;
        r.writeLine(t("{")).withIndent(() => {
          r.writeJoined(Cr, this.fields).newLine();
        }).write(t("}")).addMarginSymbol(t("+"));
      }
    };
    function Sn(e, r, t) {
      switch (e.kind) {
        case "MutuallyExclusiveFields":
          Ad(e, r);
          break;
        case "IncludeOnScalar":
          Cd(e, r);
          break;
        case "EmptySelection":
          Id(e, r, t);
          break;
        case "UnknownSelectionField":
          _d(e, r);
          break;
        case "InvalidSelectionValue":
          Nd(e, r);
          break;
        case "UnknownArgument":
          Ld(e, r);
          break;
        case "UnknownInputField":
          Fd(e, r);
          break;
        case "RequiredArgumentMissing":
          Md(e, r);
          break;
        case "InvalidArgumentType":
          $d(e, r);
          break;
        case "InvalidArgumentValue":
          qd(e, r);
          break;
        case "ValueTooLarge":
          Vd(e, r);
          break;
        case "SomeFieldsMissing":
          jd(e, r);
          break;
        case "TooManyFieldsGiven":
          Bd(e, r);
          break;
        case "Union":
          na(e, r, t);
          break;
        default:
          throw new Error("not implemented: " + e.kind);
      }
    }
    __name(Sn, "Sn");
    function Ad(e, r) {
      let t = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      t && (t.getField(e.firstField)?.markAsError(), t.getField(e.secondField)?.markAsError()), r.addErrorMessage((n) => `Please ${n.bold("either")} use ${n.green(`\`${e.firstField}\``)} or ${n.green(`\`${e.secondField}\``)}, but ${n.red("not both")} at the same time.`);
    }
    __name(Ad, "Ad");
    function Cd(e, r) {
      let [t, n] = Or(e.selectionPath), i = e.outputType, o = r.arguments.getDeepSelectionParent(t)?.value;
      if (o && (o.getField(n)?.markAsError(), i)) for (let s of i.fields) s.isRelation && o.addSuggestion(new le(s.name, "true"));
      r.addErrorMessage((s) => {
        let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
        return i ? a += ` on model ${s.bold(i.name)}. ${dt(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
      });
    }
    __name(Cd, "Cd");
    function Id(e, r, t) {
      let n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (n) {
        let i = n.getField("omit")?.value.asObject();
        if (i) {
          Dd(e, r, i);
          return;
        }
        if (n.hasField("select")) {
          Od(e, r);
          return;
        }
      }
      if (t?.[We(e.outputType.name)]) {
        kd(e, r);
        return;
      }
      r.addErrorMessage(() => `Unknown field at "${e.selectionPath.join(".")} selection"`);
    }
    __name(Id, "Id");
    function Dd(e, r, t) {
      t.removeAllFields();
      for (let n of e.outputType.fields) t.addSuggestion(new le(n.name, "false"));
      r.addErrorMessage((n) => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e.outputType.name)}. At least one field must be included in the result`);
    }
    __name(Dd, "Dd");
    function Od(e, r) {
      let t = e.outputType, n = r.arguments.getDeepSelectionParent(e.selectionPath)?.value, i = n?.isEmpty() ?? false;
      n && (n.removeAllFields(), pa(n, t)), r.addErrorMessage((o) => i ? `The ${o.red("`select`")} statement for type ${o.bold(t.name)} must not be empty. ${dt(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(t.name)} needs ${o.bold("at least one truthy value")}.`);
    }
    __name(Od, "Od");
    function kd(e, r) {
      let t = new pt();
      for (let i of e.outputType.fields) i.isRelation || t.addField(i.name, "false");
      let n = new le("omit", t).makeRequired();
      if (e.selectionPath.length === 0) r.arguments.addSuggestion(n);
      else {
        let [i, o] = Or(e.selectionPath), a = r.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
        if (a) {
          let l = a?.value.asObject() ?? new Dr();
          l.addSuggestion(n), a.value = l;
        }
      }
      r.addErrorMessage((i) => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e.outputType.name)}. At least one field must be included in the result`);
    }
    __name(kd, "kd");
    function _d(e, r) {
      let t = da(e.selectionPath, r);
      if (t.parentKind !== "unknown") {
        t.field.markAsError();
        let n = t.parent;
        switch (t.parentKind) {
          case "select":
            pa(n, e.outputType);
            break;
          case "include":
            Ud(n, e.outputType);
            break;
          case "omit":
            Gd(n, e.outputType);
            break;
        }
      }
      r.addErrorMessage((n) => {
        let i = [`Unknown field ${n.red(`\`${t.fieldName}\``)}`];
        return t.parentKind !== "unknown" && i.push(`for ${n.bold(t.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e.outputType.name}\``)}.`), i.push(dt(n)), i.join(" ");
      });
    }
    __name(_d, "_d");
    function Nd(e, r) {
      let t = da(e.selectionPath, r);
      t.parentKind !== "unknown" && t.field.value.markAsError(), r.addErrorMessage((n) => `Invalid value for selection field \`${n.red(t.fieldName)}\`: ${e.underlyingError}`);
    }
    __name(Nd, "Nd");
    function Ld(e, r) {
      let t = e.argumentPath[0], n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && (n.getField(t)?.markAsError(), Qd(n, e.arguments)), r.addErrorMessage((i) => ua(i, t, e.arguments.map((o) => o.name)));
    }
    __name(Ld, "Ld");
    function Fd(e, r) {
      let [t, n] = Or(e.argumentPath), i = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (i) {
        i.getDeepField(e.argumentPath)?.markAsError();
        let o = i.getDeepFieldValue(t)?.asObject();
        o && ma(o, e.inputType);
      }
      r.addErrorMessage((o) => ua(o, n, e.inputType.fields.map((s) => s.name)));
    }
    __name(Fd, "Fd");
    function ua(e, r, t) {
      let n = [`Unknown argument \`${e.red(r)}\`.`], i = Jd(r, t);
      return i && n.push(`Did you mean \`${e.green(i)}\`?`), t.length > 0 && n.push(dt(e)), n.join(" ");
    }
    __name(ua, "ua");
    function Md(e, r) {
      let t;
      r.addErrorMessage((l) => t?.value instanceof Q && t.value.text === "null" ? `Argument \`${l.green(o)}\` must not be ${l.red("null")}.` : `Argument \`${l.green(o)}\` is missing.`);
      let n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (!n) return;
      let [i, o] = Or(e.argumentPath), s = new pt(), a = n.getDeepFieldValue(i)?.asObject();
      if (a) {
        if (t = a.getField(o), t && a.removeField(o), e.inputTypes.length === 1 && e.inputTypes[0].kind === "object") {
          for (let l of e.inputTypes[0].fields) s.addField(l.name, l.typeNames.join(" | "));
          a.addSuggestion(new le(o, s).makeRequired());
        } else {
          let l = e.inputTypes.map(ca).join(" | ");
          a.addSuggestion(new le(o, l).makeRequired());
        }
        if (e.dependentArgumentPath) {
          n.getDeepField(e.dependentArgumentPath)?.markAsError();
          let [, l] = Or(e.dependentArgumentPath);
          r.addErrorMessage((u) => `Argument \`${u.green(o)}\` is required because argument \`${u.green(l)}\` was provided.`);
        }
      }
    }
    __name(Md, "Md");
    function ca(e) {
      return e.kind === "list" ? `${ca(e.elementType)}[]` : e.name;
    }
    __name(ca, "ca");
    function $d(e, r) {
      let t = e.argument.name, n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), r.addErrorMessage((i) => {
        let o = In("or", e.argument.typeNames.map((s) => i.green(s)));
        return `Argument \`${i.bold(t)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e.inferredType)}.`;
      });
    }
    __name($d, "$d");
    function qd(e, r) {
      let t = e.argument.name, n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      n && n.getDeepFieldValue(e.argumentPath)?.markAsError(), r.addErrorMessage((i) => {
        let o = [`Invalid value for argument \`${i.bold(t)}\``];
        if (e.underlyingError && o.push(`: ${e.underlyingError}`), o.push("."), e.argument.typeNames.length > 0) {
          let s = In("or", e.argument.typeNames.map((a) => i.green(a)));
          o.push(` Expected ${s}.`);
        }
        return o.join("");
      });
    }
    __name(qd, "qd");
    function Vd(e, r) {
      let t = e.argument.name, n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i;
      if (n) {
        let s = n.getDeepField(e.argumentPath)?.value;
        s?.markAsError(), s instanceof Q && (i = s.text);
      }
      r.addErrorMessage((o) => {
        let s = ["Unable to fit value"];
        return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(t)}\``), s.join(" ");
      });
    }
    __name(Vd, "Vd");
    function jd(e, r) {
      let t = e.argumentPath[e.argumentPath.length - 1], n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject();
      if (n) {
        let i = n.getDeepFieldValue(e.argumentPath)?.asObject();
        i && ma(i, e.inputType);
      }
      r.addErrorMessage((i) => {
        let o = [`Argument \`${i.bold(t)}\` of type ${i.bold(e.inputType.name)} needs`];
        return e.constraints.minFieldCount === 1 ? e.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${In("or", e.constraints.requiredFields.map((s) => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${e.constraints.minFieldCount}`)} arguments.`), o.push(dt(i)), o.join(" ");
      });
    }
    __name(jd, "jd");
    function Bd(e, r) {
      let t = e.argumentPath[e.argumentPath.length - 1], n = r.arguments.getDeepSubSelectionValue(e.selectionPath)?.asObject(), i = [];
      if (n) {
        let o = n.getDeepFieldValue(e.argumentPath)?.asObject();
        o && (o.markAsError(), i = Object.keys(o.getFields()));
      }
      r.addErrorMessage((o) => {
        let s = [`Argument \`${o.bold(t)}\` of type ${o.bold(e.inputType.name)} needs`];
        return e.constraints.minFieldCount === 1 && e.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : e.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${e.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${In("and", i.map((a) => o.red(a)))}. Please choose`), e.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e.constraints.maxFieldCount}.`), s.join(" ");
      });
    }
    __name(Bd, "Bd");
    function pa(e, r) {
      for (let t of r.fields) e.hasField(t.name) || e.addSuggestion(new le(t.name, "true"));
    }
    __name(pa, "pa");
    function Ud(e, r) {
      for (let t of r.fields) t.isRelation && !e.hasField(t.name) && e.addSuggestion(new le(t.name, "true"));
    }
    __name(Ud, "Ud");
    function Gd(e, r) {
      for (let t of r.fields) !e.hasField(t.name) && !t.isRelation && e.addSuggestion(new le(t.name, "true"));
    }
    __name(Gd, "Gd");
    function Qd(e, r) {
      for (let t of r) e.hasField(t.name) || e.addSuggestion(new le(t.name, t.typeNames.join(" | ")));
    }
    __name(Qd, "Qd");
    function da(e, r) {
      let [t, n] = Or(e), i = r.arguments.getDeepSubSelectionValue(t)?.asObject();
      if (!i) return { parentKind: "unknown", fieldName: n };
      let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), l = o?.getField(n);
      return o && l ? { parentKind: "select", parent: o, field: l, fieldName: n } : (l = s?.getField(n), s && l ? { parentKind: "include", field: l, parent: s, fieldName: n } : (l = a?.getField(n), a && l ? { parentKind: "omit", field: l, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n }));
    }
    __name(da, "da");
    function ma(e, r) {
      if (r.kind === "object") for (let t of r.fields) e.hasField(t.name) || e.addSuggestion(new le(t.name, t.typeNames.join(" | ")));
    }
    __name(ma, "ma");
    function Or(e) {
      let r = [...e], t = r.pop();
      if (!t) throw new Error("unexpected empty path");
      return [r, t];
    }
    __name(Or, "Or");
    function dt({ green: e, enabled: r }) {
      return "Available options are " + (r ? `listed in ${e("green")}` : "marked with ?") + ".";
    }
    __name(dt, "dt");
    function In(e, r) {
      if (r.length === 1) return r[0];
      let t = [...r], n = t.pop();
      return `${t.join(", ")} ${e} ${n}`;
    }
    __name(In, "In");
    var Wd = 3;
    function Jd(e, r) {
      let t = 1 / 0, n;
      for (let i of r) {
        let o = (0, la.default)(e, i);
        o > Wd || o < t && (t = o, n = i);
      }
      return n;
    }
    __name(Jd, "Jd");
    var mt = class {
      static {
        __name(this, "mt");
      }
      modelName;
      name;
      typeName;
      isList;
      isEnum;
      constructor(r, t, n, i, o) {
        this.modelName = r, this.name = t, this.typeName = n, this.isList = i, this.isEnum = o;
      }
      _toGraphQLInputType() {
        let r = this.isList ? "List" : "", t = this.isEnum ? "Enum" : "";
        return `${r}${t}${this.typeName}FieldRefInput<${this.modelName}>`;
      }
    };
    function kr(e) {
      return e instanceof mt;
    }
    __name(kr, "kr");
    var Dn = Symbol();
    var Yi = /* @__PURE__ */ new WeakMap();
    var Me = class {
      static {
        __name(this, "Me");
      }
      constructor(r) {
        r === Dn ? Yi.set(this, `Prisma.${this._getName()}`) : Yi.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
      }
      _getName() {
        return this.constructor.name;
      }
      toString() {
        return Yi.get(this);
      }
    };
    var ft = class extends Me {
      static {
        __name(this, "ft");
      }
      _getNamespace() {
        return "NullTypes";
      }
    };
    var gt = class extends ft {
      static {
        __name(this, "gt");
      }
      #e;
    };
    zi(gt, "DbNull");
    var ht = class extends ft {
      static {
        __name(this, "ht");
      }
      #e;
    };
    zi(ht, "JsonNull");
    var yt = class extends ft {
      static {
        __name(this, "yt");
      }
      #e;
    };
    zi(yt, "AnyNull");
    var On = { classes: { DbNull: gt, JsonNull: ht, AnyNull: yt }, instances: { DbNull: new gt(Dn), JsonNull: new ht(Dn), AnyNull: new yt(Dn) } };
    function zi(e, r) {
      Object.defineProperty(e, "name", { value: r, configurable: true });
    }
    __name(zi, "zi");
    var fa = ": ";
    var kn = class {
      static {
        __name(this, "kn");
      }
      constructor(r, t) {
        this.name = r;
        this.value = t;
      }
      hasError = false;
      markAsError() {
        this.hasError = true;
      }
      getPrintWidth() {
        return this.name.length + this.value.getPrintWidth() + fa.length;
      }
      write(r) {
        let t = new Pe(this.name);
        this.hasError && t.underline().setColor(r.context.colors.red), r.write(t).write(fa).write(this.value);
      }
    };
    var Zi = class {
      static {
        __name(this, "Zi");
      }
      arguments;
      errorMessages = [];
      constructor(r) {
        this.arguments = r;
      }
      write(r) {
        r.write(this.arguments);
      }
      addErrorMessage(r) {
        this.errorMessages.push(r);
      }
      renderAllMessages(r) {
        return this.errorMessages.map((t) => t(r)).join(`
`);
      }
    };
    function _r(e) {
      return new Zi(ga(e));
    }
    __name(_r, "_r");
    function ga(e) {
      let r = new Dr();
      for (let [t, n] of Object.entries(e)) {
        let i = new kn(t, ha(n));
        r.addField(i);
      }
      return r;
    }
    __name(ga, "ga");
    function ha(e) {
      if (typeof e == "string") return new Q(JSON.stringify(e));
      if (typeof e == "number" || typeof e == "boolean") return new Q(String(e));
      if (typeof e == "bigint") return new Q(`${e}n`);
      if (e === null) return new Q("null");
      if (e === void 0) return new Q("undefined");
      if (Sr(e)) return new Q(`new Prisma.Decimal("${e.toFixed()}")`);
      if (e instanceof Uint8Array) return Buffer.isBuffer(e) ? new Q(`Buffer.alloc(${e.byteLength})`) : new Q(`new Uint8Array(${e.byteLength})`);
      if (e instanceof Date) {
        let r = mn(e) ? e.toISOString() : "Invalid Date";
        return new Q(`new Date("${r}")`);
      }
      return e instanceof Me ? new Q(`Prisma.${e._getName()}`) : kr(e) ? new Q(`prisma.${We(e.modelName)}.$fields.${e.name}`) : Array.isArray(e) ? Kd(e) : typeof e == "object" ? ga(e) : new Q(Object.prototype.toString.call(e));
    }
    __name(ha, "ha");
    function Kd(e) {
      let r = new Ir();
      for (let t of e) r.addItem(ha(t));
      return r;
    }
    __name(Kd, "Kd");
    function _n(e, r) {
      let t = r === "pretty" ? aa : Cn, n = e.renderAllMessages(t), i = new Ar(0, { colors: t }).write(e).toString();
      return { message: n, args: i };
    }
    __name(_n, "_n");
    function Nn({ args: e, errors: r, errorFormat: t, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) {
      let a = _r(e);
      for (let p of r) Sn(p, a, s);
      let { message: l, args: u } = _n(a, t), c = Tn({ message: l, callsite: n, originalMethod: i, showColors: t === "pretty", callArguments: u });
      throw new Z(c, { clientVersion: o });
    }
    __name(Nn, "Nn");
    function Te(e) {
      return e.replace(/^./, (r) => r.toLowerCase());
    }
    __name(Te, "Te");
    function ba(e, r, t) {
      let n = Te(t);
      return !r.result || !(r.result.$allModels || r.result[n]) ? e : Hd({ ...e, ...ya(r.name, e, r.result.$allModels), ...ya(r.name, e, r.result[n]) });
    }
    __name(ba, "ba");
    function Hd(e) {
      let r = new we(), t = /* @__PURE__ */ __name((n, i) => r.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e[n] ? e[n].needs.flatMap((o) => t(o, i)) : [n])), "t");
      return pn(e, (n) => ({ ...n, needs: t(n.name, /* @__PURE__ */ new Set()) }));
    }
    __name(Hd, "Hd");
    function ya(e, r, t) {
      return t ? pn(t, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter((s) => n[s]) : [], compute: Yd(r, o, i) })) : {};
    }
    __name(ya, "ya");
    function Yd(e, r, t) {
      let n = e?.[r]?.compute;
      return n ? (i) => t({ ...i, [r]: n(i) }) : t;
    }
    __name(Yd, "Yd");
    function Ea(e, r) {
      if (!r) return e;
      let t = { ...e };
      for (let n of Object.values(r)) if (e[n.name]) for (let i of n.needs) t[i] = true;
      return t;
    }
    __name(Ea, "Ea");
    function wa(e, r) {
      if (!r) return e;
      let t = { ...e };
      for (let n of Object.values(r)) if (!e[n.name]) for (let i of n.needs) delete t[i];
      return t;
    }
    __name(wa, "wa");
    var Ln = class {
      static {
        __name(this, "Ln");
      }
      constructor(r, t) {
        this.extension = r;
        this.previous = t;
      }
      computedFieldsCache = new we();
      modelExtensionsCache = new we();
      queryCallbacksCache = new we();
      clientExtensions = lt(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
      batchCallbacks = lt(() => {
        let r = this.previous?.getAllBatchQueryCallbacks() ?? [], t = this.extension.query?.$__internalBatch;
        return t ? r.concat(t) : r;
      });
      getAllComputedFields(r) {
        return this.computedFieldsCache.getOrCreate(r, () => ba(this.previous?.getAllComputedFields(r), this.extension, r));
      }
      getAllClientExtensions() {
        return this.clientExtensions.get();
      }
      getAllModelExtensions(r) {
        return this.modelExtensionsCache.getOrCreate(r, () => {
          let t = Te(r);
          return !this.extension.model || !(this.extension.model[t] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(r) : { ...this.previous?.getAllModelExtensions(r), ...this.extension.model.$allModels, ...this.extension.model[t] };
        });
      }
      getAllQueryCallbacks(r, t) {
        return this.queryCallbacksCache.getOrCreate(`${r}:${t}`, () => {
          let n = this.previous?.getAllQueryCallbacks(r, t) ?? [], i = [], o = this.extension.query;
          return !o || !(o[r] || o.$allModels || o[t] || o.$allOperations) ? n : (o[r] !== void 0 && (o[r][t] !== void 0 && i.push(o[r][t]), o[r].$allOperations !== void 0 && i.push(o[r].$allOperations)), r !== "$none" && o.$allModels !== void 0 && (o.$allModels[t] !== void 0 && i.push(o.$allModels[t]), o.$allModels.$allOperations !== void 0 && i.push(o.$allModels.$allOperations)), o[t] !== void 0 && i.push(o[t]), o.$allOperations !== void 0 && i.push(o.$allOperations), n.concat(i));
        });
      }
      getAllBatchQueryCallbacks() {
        return this.batchCallbacks.get();
      }
    };
    var Nr = class e {
      static {
        __name(this, "e");
      }
      constructor(r) {
        this.head = r;
      }
      static empty() {
        return new e();
      }
      static single(r) {
        return new e(new Ln(r));
      }
      isEmpty() {
        return this.head === void 0;
      }
      append(r) {
        return new e(new Ln(r, this.head));
      }
      getAllComputedFields(r) {
        return this.head?.getAllComputedFields(r);
      }
      getAllClientExtensions() {
        return this.head?.getAllClientExtensions();
      }
      getAllModelExtensions(r) {
        return this.head?.getAllModelExtensions(r);
      }
      getAllQueryCallbacks(r, t) {
        return this.head?.getAllQueryCallbacks(r, t) ?? [];
      }
      getAllBatchQueryCallbacks() {
        return this.head?.getAllBatchQueryCallbacks() ?? [];
      }
    };
    var Fn = class {
      static {
        __name(this, "Fn");
      }
      constructor(r) {
        this.name = r;
      }
    };
    function xa(e) {
      return e instanceof Fn;
    }
    __name(xa, "xa");
    function va(e) {
      return new Fn(e);
    }
    __name(va, "va");
    var Pa = Symbol();
    var bt = class {
      static {
        __name(this, "bt");
      }
      constructor(r) {
        if (r !== Pa) throw new Error("Skip instance can not be constructed directly");
      }
      ifUndefined(r) {
        return r === void 0 ? Mn : r;
      }
    };
    var Mn = new bt(Pa);
    function Se(e) {
      return e instanceof bt;
    }
    __name(Se, "Se");
    var zd = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
    var Ta = "explicitly `undefined` values are not allowed";
    function $n({ modelName: e, action: r, args: t, runtimeDataModel: n, extensions: i = Nr.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: c }) {
      let p = new Xi({ runtimeDataModel: n, modelName: e, action: r, rootArgs: t, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: c });
      return { modelName: e, action: zd[r], query: Et(t, p) };
    }
    __name($n, "$n");
    function Et({ select: e, include: r, ...t } = {}, n) {
      let i = t.omit;
      return delete t.omit, { arguments: Ra(t, n), selection: Zd(e, r, i, n) };
    }
    __name(Et, "Et");
    function Zd(e, r, t, n) {
      return e ? (r ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : t && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), tm(e, n)) : Xd(n, r, t);
    }
    __name(Zd, "Zd");
    function Xd(e, r, t) {
      let n = {};
      return e.modelOrType && !e.isRawAction() && (n.$composites = true, n.$scalars = true), r && em(n, r, e), rm(n, t, e), n;
    }
    __name(Xd, "Xd");
    function em(e, r, t) {
      for (let [n, i] of Object.entries(r)) {
        if (Se(i)) continue;
        let o = t.nestSelection(n);
        if (eo(i, o), i === false || i === void 0) {
          e[n] = false;
          continue;
        }
        let s = t.findField(n);
        if (s && s.kind !== "object" && t.throwValidationError({ kind: "IncludeOnScalar", selectionPath: t.getSelectionPath().concat(n), outputType: t.getOutputTypeDescription() }), s) {
          e[n] = Et(i === true ? {} : i, o);
          continue;
        }
        if (i === true) {
          e[n] = true;
          continue;
        }
        e[n] = Et(i, o);
      }
    }
    __name(em, "em");
    function rm(e, r, t) {
      let n = t.getComputedFields(), i = { ...t.getGlobalOmit(), ...r }, o = wa(i, n);
      for (let [s, a] of Object.entries(o)) {
        if (Se(a)) continue;
        eo(a, t.nestSelection(s));
        let l = t.findField(s);
        n?.[s] && !l || (e[s] = !a);
      }
    }
    __name(rm, "rm");
    function tm(e, r) {
      let t = {}, n = r.getComputedFields(), i = Ea(e, n);
      for (let [o, s] of Object.entries(i)) {
        if (Se(s)) continue;
        let a = r.nestSelection(o);
        eo(s, a);
        let l = r.findField(o);
        if (!(n?.[o] && !l)) {
          if (s === false || s === void 0 || Se(s)) {
            t[o] = false;
            continue;
          }
          if (s === true) {
            l?.kind === "object" ? t[o] = Et({}, a) : t[o] = true;
            continue;
          }
          t[o] = Et(s, a);
        }
      }
      return t;
    }
    __name(tm, "tm");
    function Sa(e, r) {
      if (e === null) return null;
      if (typeof e == "string" || typeof e == "number" || typeof e == "boolean") return e;
      if (typeof e == "bigint") return { $type: "BigInt", value: String(e) };
      if (vr(e)) {
        if (mn(e)) return { $type: "DateTime", value: e.toISOString() };
        r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r.getSelectionPath(), argumentPath: r.getArgumentPath(), argument: { name: r.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
      }
      if (xa(e)) return { $type: "Param", value: e.name };
      if (kr(e)) return { $type: "FieldRef", value: { _ref: e.name, _container: e.modelName } };
      if (Array.isArray(e)) return nm(e, r);
      if (ArrayBuffer.isView(e)) {
        let { buffer: t, byteOffset: n, byteLength: i } = e;
        return { $type: "Bytes", value: Buffer.from(t, n, i).toString("base64") };
      }
      if (im(e)) return e.values;
      if (Sr(e)) return { $type: "Decimal", value: e.toFixed() };
      if (e instanceof Me) {
        if (e !== On.instances[e._getName()]) throw new Error("Invalid ObjectEnumValue");
        return { $type: "Enum", value: e._getName() };
      }
      if (om(e)) return e.toJSON();
      if (typeof e == "object") return Ra(e, r);
      r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r.getSelectionPath(), argumentPath: r.getArgumentPath(), argument: { name: r.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
    }
    __name(Sa, "Sa");
    function Ra(e, r) {
      if (e.$type) return { $type: "Raw", value: e };
      let t = {};
      for (let n in e) {
        let i = e[n], o = r.nestArgument(n);
        Se(i) || (i !== void 0 ? t[n] = Sa(i, o) : r.isPreviewFeatureOn("strictUndefinedChecks") && r.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: r.getSelectionPath(), argument: { name: r.getArgumentName(), typeNames: [] }, underlyingError: Ta }));
      }
      return t;
    }
    __name(Ra, "Ra");
    function nm(e, r) {
      let t = [];
      for (let n = 0; n < e.length; n++) {
        let i = r.nestArgument(String(n)), o = e[n];
        if (o === void 0 || Se(o)) {
          let s = o === void 0 ? "undefined" : "Prisma.skip";
          r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${r.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
        }
        t.push(Sa(o, i));
      }
      return t;
    }
    __name(nm, "nm");
    function im(e) {
      return typeof e == "object" && e !== null && e.__prismaRawParameters__ === true;
    }
    __name(im, "im");
    function om(e) {
      return typeof e == "object" && e !== null && typeof e.toJSON == "function";
    }
    __name(om, "om");
    function eo(e, r) {
      e === void 0 && r.isPreviewFeatureOn("strictUndefinedChecks") && r.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: r.getSelectionPath(), underlyingError: Ta });
    }
    __name(eo, "eo");
    var Xi = class e {
      static {
        __name(this, "e");
      }
      constructor(r) {
        this.params = r;
        this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
      }
      modelOrType;
      throwValidationError(r) {
        Nn({ errors: [r], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
      }
      getSelectionPath() {
        return this.params.selectionPath;
      }
      getArgumentPath() {
        return this.params.argumentPath;
      }
      getArgumentName() {
        return this.params.argumentPath[this.params.argumentPath.length - 1];
      }
      getOutputTypeDescription() {
        if (!(!this.params.modelName || !this.modelOrType)) return { name: this.params.modelName, fields: this.modelOrType.fields.map((r) => ({ name: r.name, typeName: "boolean", isRelation: r.kind === "object" })) };
      }
      isRawAction() {
        return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action);
      }
      isPreviewFeatureOn(r) {
        return this.params.previewFeatures.includes(r);
      }
      getComputedFields() {
        if (this.params.modelName) return this.params.extensions.getAllComputedFields(this.params.modelName);
      }
      findField(r) {
        return this.modelOrType?.fields.find((t) => t.name === r);
      }
      nestSelection(r) {
        let t = this.findField(r), n = t?.kind === "object" ? t.type : void 0;
        return new e({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(r) });
      }
      getGlobalOmit() {
        return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[We(this.params.modelName)] ?? {} : {};
      }
      shouldApplyGlobalOmit() {
        switch (this.params.action) {
          case "findFirst":
          case "findFirstOrThrow":
          case "findUniqueOrThrow":
          case "findMany":
          case "upsert":
          case "findUnique":
          case "createManyAndReturn":
          case "create":
          case "update":
          case "updateManyAndReturn":
          case "delete":
            return true;
          case "executeRaw":
          case "aggregateRaw":
          case "runCommandRaw":
          case "findRaw":
          case "createMany":
          case "deleteMany":
          case "groupBy":
          case "updateMany":
          case "count":
          case "aggregate":
          case "queryRaw":
            return false;
          default:
            ar(this.params.action, "Unknown action");
        }
      }
      nestArgument(r) {
        return new e({ ...this.params, argumentPath: this.params.argumentPath.concat(r) });
      }
    };
    function Aa(e) {
      if (!e._hasPreviewFlag("metrics")) throw new Z("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e._clientVersion });
    }
    __name(Aa, "Aa");
    var Lr = class {
      static {
        __name(this, "Lr");
      }
      _client;
      constructor(r) {
        this._client = r;
      }
      prometheus(r) {
        return Aa(this._client), this._client._engine.metrics({ format: "prometheus", ...r });
      }
      json(r) {
        return Aa(this._client), this._client._engine.metrics({ format: "json", ...r });
      }
    };
    function Ca(e, r) {
      let t = lt(() => sm(r));
      Object.defineProperty(e, "dmmf", { get: /* @__PURE__ */ __name(() => t.get(), "get") });
    }
    __name(Ca, "Ca");
    function sm(e) {
      return { datamodel: { models: ro(e.models), enums: ro(e.enums), types: ro(e.types) } };
    }
    __name(sm, "sm");
    function ro(e) {
      return Object.entries(e).map(([r, t]) => ({ name: r, ...t }));
    }
    __name(ro, "ro");
    var to = /* @__PURE__ */ new WeakMap();
    var qn = "$$PrismaTypedSql";
    var wt = class {
      static {
        __name(this, "wt");
      }
      constructor(r, t) {
        to.set(this, { sql: r, values: t }), Object.defineProperty(this, qn, { value: qn });
      }
      get sql() {
        return to.get(this).sql;
      }
      get values() {
        return to.get(this).values;
      }
    };
    function Ia(e) {
      return (...r) => new wt(e, r);
    }
    __name(Ia, "Ia");
    function Vn(e) {
      return e != null && e[qn] === qn;
    }
    __name(Vn, "Vn");
    var cu = O(Ti());
    var pu = __require("node:async_hooks");
    var du = __require("node:events");
    var mu = O(__require("node:fs"));
    var ri = O(__require("node:path"));
    var ie = class e {
      static {
        __name(this, "e");
      }
      constructor(r, t) {
        if (r.length - 1 !== t.length) throw r.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${r.length} strings to have ${r.length - 1} values`);
        let n = t.reduce((s, a) => s + (a instanceof e ? a.values.length : 1), 0);
        this.values = new Array(n), this.strings = new Array(n + 1), this.strings[0] = r[0];
        let i = 0, o = 0;
        for (; i < t.length; ) {
          let s = t[i++], a = r[i];
          if (s instanceof e) {
            this.strings[o] += s.strings[0];
            let l = 0;
            for (; l < s.values.length; ) this.values[o++] = s.values[l++], this.strings[o] = s.strings[l];
            this.strings[o] += a;
          } else this.values[o++] = s, this.strings[o] = a;
        }
      }
      get sql() {
        let r = this.strings.length, t = 1, n = this.strings[0];
        for (; t < r; ) n += `?${this.strings[t++]}`;
        return n;
      }
      get statement() {
        let r = this.strings.length, t = 1, n = this.strings[0];
        for (; t < r; ) n += `:${t}${this.strings[t++]}`;
        return n;
      }
      get text() {
        let r = this.strings.length, t = 1, n = this.strings[0];
        for (; t < r; ) n += `$${t}${this.strings[t++]}`;
        return n;
      }
      inspect() {
        return { sql: this.sql, statement: this.statement, text: this.text, values: this.values };
      }
    };
    function Da(e, r = ",", t = "", n = "") {
      if (e.length === 0) throw new TypeError("Expected `join([])` to be called with an array of multiple elements, but got an empty array");
      return new ie([t, ...Array(e.length - 1).fill(r), n], e);
    }
    __name(Da, "Da");
    function no(e) {
      return new ie([e], []);
    }
    __name(no, "no");
    var Oa = no("");
    function io(e, ...r) {
      return new ie(e, r);
    }
    __name(io, "io");
    function xt(e) {
      return { getKeys() {
        return Object.keys(e);
      }, getPropertyValue(r) {
        return e[r];
      } };
    }
    __name(xt, "xt");
    function re(e, r) {
      return { getKeys() {
        return [e];
      }, getPropertyValue() {
        return r();
      } };
    }
    __name(re, "re");
    function lr(e) {
      let r = new we();
      return { getKeys() {
        return e.getKeys();
      }, getPropertyValue(t) {
        return r.getOrCreate(t, () => e.getPropertyValue(t));
      }, getPropertyDescriptor(t) {
        return e.getPropertyDescriptor?.(t);
      } };
    }
    __name(lr, "lr");
    var jn = { enumerable: true, configurable: true, writable: true };
    function Bn(e) {
      let r = new Set(e);
      return { getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf"), getOwnPropertyDescriptor: /* @__PURE__ */ __name(() => jn, "getOwnPropertyDescriptor"), has: /* @__PURE__ */ __name((t, n) => r.has(n), "has"), set: /* @__PURE__ */ __name((t, n, i) => r.add(n) && Reflect.set(t, n, i), "set"), ownKeys: /* @__PURE__ */ __name(() => [...r], "ownKeys") };
    }
    __name(Bn, "Bn");
    var ka = Symbol.for("nodejs.util.inspect.custom");
    function he(e, r) {
      let t = am(r), n = /* @__PURE__ */ new Set(), i = new Proxy(e, { get(o, s) {
        if (n.has(s)) return o[s];
        let a = t.get(s);
        return a ? a.getPropertyValue(s) : o[s];
      }, has(o, s) {
        if (n.has(s)) return true;
        let a = t.get(s);
        return a ? a.has?.(s) ?? true : Reflect.has(o, s);
      }, ownKeys(o) {
        let s = _a(Reflect.ownKeys(o), t), a = _a(Array.from(t.keys()), t);
        return [.../* @__PURE__ */ new Set([...s, ...a, ...n])];
      }, set(o, s, a) {
        return t.get(s)?.getPropertyDescriptor?.(s)?.writable === false ? false : (n.add(s), Reflect.set(o, s, a));
      }, getOwnPropertyDescriptor(o, s) {
        let a = Reflect.getOwnPropertyDescriptor(o, s);
        if (a && !a.configurable) return a;
        let l = t.get(s);
        return l ? l.getPropertyDescriptor ? { ...jn, ...l?.getPropertyDescriptor(s) } : jn : a;
      }, defineProperty(o, s, a) {
        return n.add(s), Reflect.defineProperty(o, s, a);
      }, getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf") });
      return i[ka] = function() {
        let o = { ...this };
        return delete o[ka], o;
      }, i;
    }
    __name(he, "he");
    function am(e) {
      let r = /* @__PURE__ */ new Map();
      for (let t of e) {
        let n = t.getKeys();
        for (let i of n) r.set(i, t);
      }
      return r;
    }
    __name(am, "am");
    function _a(e, r) {
      return e.filter((t) => r.get(t)?.has?.(t) ?? true);
    }
    __name(_a, "_a");
    function Fr(e) {
      return { getKeys() {
        return e;
      }, has() {
        return false;
      }, getPropertyValue() {
      } };
    }
    __name(Fr, "Fr");
    function Mr(e, r) {
      return { batch: e, transaction: r?.kind === "batch" ? { isolationLevel: r.options.isolationLevel } : void 0 };
    }
    __name(Mr, "Mr");
    function Na(e) {
      if (e === void 0) return "";
      let r = _r(e);
      return new Ar(0, { colors: Cn }).write(r).toString();
    }
    __name(Na, "Na");
    var lm = "P2037";
    function $r({ error: e, user_facing_error: r }, t, n) {
      return r.error_code ? new z(um(r, n), { code: r.error_code, clientVersion: t, meta: r.meta, batchRequestIdx: r.batch_request_idx }) : new V(e, { clientVersion: t, batchRequestIdx: r.batch_request_idx });
    }
    __name($r, "$r");
    function um(e, r) {
      let t = e.message;
      return (r === "postgresql" || r === "postgres" || r === "mysql") && e.error_code === lm && (t += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), t;
    }
    __name(um, "um");
    var vt = "<unknown>";
    function La(e) {
      var r = e.split(`
`);
      return r.reduce(function(t, n) {
        var i = dm(n) || fm(n) || ym(n) || xm(n) || Em(n);
        return i && t.push(i), t;
      }, []);
    }
    __name(La, "La");
    var cm = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
    var pm = /\((\S*)(?::(\d+))(?::(\d+))\)/;
    function dm(e) {
      var r = cm.exec(e);
      if (!r) return null;
      var t = r[2] && r[2].indexOf("native") === 0, n = r[2] && r[2].indexOf("eval") === 0, i = pm.exec(r[2]);
      return n && i != null && (r[2] = i[1], r[3] = i[2], r[4] = i[3]), { file: t ? null : r[2], methodName: r[1] || vt, arguments: t ? [r[2]] : [], lineNumber: r[3] ? +r[3] : null, column: r[4] ? +r[4] : null };
    }
    __name(dm, "dm");
    var mm = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function fm(e) {
      var r = mm.exec(e);
      return r ? { file: r[2], methodName: r[1] || vt, arguments: [], lineNumber: +r[3], column: r[4] ? +r[4] : null } : null;
    }
    __name(fm, "fm");
    var gm = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
    var hm = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
    function ym(e) {
      var r = gm.exec(e);
      if (!r) return null;
      var t = r[3] && r[3].indexOf(" > eval") > -1, n = hm.exec(r[3]);
      return t && n != null && (r[3] = n[1], r[4] = n[2], r[5] = null), { file: r[3], methodName: r[1] || vt, arguments: r[2] ? r[2].split(",") : [], lineNumber: r[4] ? +r[4] : null, column: r[5] ? +r[5] : null };
    }
    __name(ym, "ym");
    var bm = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
    function Em(e) {
      var r = bm.exec(e);
      return r ? { file: r[3], methodName: r[1] || vt, arguments: [], lineNumber: +r[4], column: r[5] ? +r[5] : null } : null;
    }
    __name(Em, "Em");
    var wm = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
    function xm(e) {
      var r = wm.exec(e);
      return r ? { file: r[2], methodName: r[1] || vt, arguments: [], lineNumber: +r[3], column: r[4] ? +r[4] : null } : null;
    }
    __name(xm, "xm");
    var oo = class {
      static {
        __name(this, "oo");
      }
      getLocation() {
        return null;
      }
    };
    var so = class {
      static {
        __name(this, "so");
      }
      _error;
      constructor() {
        this._error = new Error();
      }
      getLocation() {
        let r = this._error.stack;
        if (!r) return null;
        let n = La(r).find((i) => {
          if (!i.file) return false;
          let o = Li(i.file);
          return o !== "<anonymous>" && !o.includes("@prisma") && !o.includes("/packages/client/src/runtime/") && !o.endsWith("/runtime/binary.js") && !o.endsWith("/runtime/library.js") && !o.endsWith("/runtime/edge.js") && !o.endsWith("/runtime/edge-esm.js") && !o.startsWith("internal/") && !i.methodName.includes("new ") && !i.methodName.includes("getCallSite") && !i.methodName.includes("Proxy.") && i.methodName.split(".").length < 4;
        });
        return !n || !n.file ? null : { fileName: n.file, lineNumber: n.lineNumber, columnNumber: n.column };
      }
    };
    function Ze(e) {
      return e === "minimal" ? typeof $EnabledCallSite == "function" && e !== "minimal" ? new $EnabledCallSite() : new oo() : new so();
    }
    __name(Ze, "Ze");
    var Fa = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
    function qr(e = {}) {
      let r = Pm(e);
      return Object.entries(r).reduce((n, [i, o]) => (Fa[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} });
    }
    __name(qr, "qr");
    function Pm(e = {}) {
      return typeof e._count == "boolean" ? { ...e, _count: { _all: e._count } } : e;
    }
    __name(Pm, "Pm");
    function Un(e = {}) {
      return (r) => (typeof e._count == "boolean" && (r._count = r._count._all), r);
    }
    __name(Un, "Un");
    function Ma(e, r) {
      let t = Un(e);
      return r({ action: "aggregate", unpacker: t, argsMapper: qr })(e);
    }
    __name(Ma, "Ma");
    function Tm(e = {}) {
      let { select: r, ...t } = e;
      return typeof r == "object" ? qr({ ...t, _count: r }) : qr({ ...t, _count: { _all: true } });
    }
    __name(Tm, "Tm");
    function Sm(e = {}) {
      return typeof e.select == "object" ? (r) => Un(e)(r)._count : (r) => Un(e)(r)._count._all;
    }
    __name(Sm, "Sm");
    function $a(e, r) {
      return r({ action: "count", unpacker: Sm(e), argsMapper: Tm })(e);
    }
    __name($a, "$a");
    function Rm(e = {}) {
      let r = qr(e);
      if (Array.isArray(r.by)) for (let t of r.by) typeof t == "string" && (r.select[t] = true);
      else typeof r.by == "string" && (r.select[r.by] = true);
      return r;
    }
    __name(Rm, "Rm");
    function Am(e = {}) {
      return (r) => (typeof e?._count == "boolean" && r.forEach((t) => {
        t._count = t._count._all;
      }), r);
    }
    __name(Am, "Am");
    function qa(e, r) {
      return r({ action: "groupBy", unpacker: Am(e), argsMapper: Rm })(e);
    }
    __name(qa, "qa");
    function Va(e, r, t) {
      if (r === "aggregate") return (n) => Ma(n, t);
      if (r === "count") return (n) => $a(n, t);
      if (r === "groupBy") return (n) => qa(n, t);
    }
    __name(Va, "Va");
    function ja(e, r) {
      let t = r.fields.filter((i) => !i.relationName), n = _s(t, "name");
      return new Proxy({}, { get(i, o) {
        if (o in i || typeof o == "symbol") return i[o];
        let s = n[o];
        if (s) return new mt(e, o, s.type, s.isList, s.kind === "enum");
      }, ...Bn(Object.keys(n)) });
    }
    __name(ja, "ja");
    var Ba = /* @__PURE__ */ __name((e) => Array.isArray(e) ? e : e.split("."), "Ba");
    var ao = /* @__PURE__ */ __name((e, r) => Ba(r).reduce((t, n) => t && t[n], e), "ao");
    var Ua = /* @__PURE__ */ __name((e, r, t) => Ba(r).reduceRight((n, i, o, s) => Object.assign({}, ao(e, s.slice(0, o)), { [i]: n }), t), "Ua");
    function Cm(e, r) {
      return e === void 0 || r === void 0 ? [] : [...r, "select", e];
    }
    __name(Cm, "Cm");
    function Im(e, r, t) {
      return r === void 0 ? e ?? {} : Ua(r, t, e || true);
    }
    __name(Im, "Im");
    function lo(e, r, t, n, i, o) {
      let a = e._runtimeDataModel.models[r].fields.reduce((l, u) => ({ ...l, [u.name]: u }), {});
      return (l) => {
        let u = Ze(e._errorFormat), c = Cm(n, i), p = Im(l, o, c), d = t({ dataPath: c, callsite: u })(p), f = Dm(e, r);
        return new Proxy(d, { get(h, g) {
          if (!f.includes(g)) return h[g];
          let T = [a[g].type, t, g], S = [c, p];
          return lo(e, ...T, ...S);
        }, ...Bn([...f, ...Object.getOwnPropertyNames(d)]) });
      };
    }
    __name(lo, "lo");
    function Dm(e, r) {
      return e._runtimeDataModel.models[r].fields.filter((t) => t.kind === "object").map((t) => t.name);
    }
    __name(Dm, "Dm");
    var Om = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
    var km = ["aggregate", "count", "groupBy"];
    function uo(e, r) {
      let t = e._extensions.getAllModelExtensions(r) ?? {}, n = [_m(e, r), Lm(e, r), xt(t), re("name", () => r), re("$name", () => r), re("$parent", () => e._appliedParent)];
      return he({}, n);
    }
    __name(uo, "uo");
    function _m(e, r) {
      let t = Te(r), n = Object.keys(Rr).concat("count");
      return { getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = i, s = /* @__PURE__ */ __name((a) => (l) => {
          let u = Ze(e._errorFormat);
          return e._createPrismaPromise((c) => {
            let p = { args: l, dataPath: [], action: o, model: r, clientMethod: `${t}.${i}`, jsModelName: t, transaction: c, callsite: u };
            return e._request({ ...p, ...a });
          }, { action: o, args: l, model: r });
        }, "s");
        return Om.includes(o) ? lo(e, r, s) : Nm(i) ? Va(e, i, s) : s({});
      } };
    }
    __name(_m, "_m");
    function Nm(e) {
      return km.includes(e);
    }
    __name(Nm, "Nm");
    function Lm(e, r) {
      return lr(re("fields", () => {
        let t = e._runtimeDataModel.models[r];
        return ja(r, t);
      }));
    }
    __name(Lm, "Lm");
    function Ga(e) {
      return e.replace(/^./, (r) => r.toUpperCase());
    }
    __name(Ga, "Ga");
    var co = Symbol();
    function Pt(e) {
      let r = [Fm(e), Mm(e), re(co, () => e), re("$parent", () => e._appliedParent)], t = e._extensions.getAllClientExtensions();
      return t && r.push(xt(t)), he(e, r);
    }
    __name(Pt, "Pt");
    function Fm(e) {
      let r = Object.getPrototypeOf(e._originalClient), t = [...new Set(Object.getOwnPropertyNames(r))];
      return { getKeys() {
        return t;
      }, getPropertyValue(n) {
        return e[n];
      } };
    }
    __name(Fm, "Fm");
    function Mm(e) {
      let r = Object.keys(e._runtimeDataModel.models), t = r.map(Te), n = [...new Set(r.concat(t))];
      return lr({ getKeys() {
        return n;
      }, getPropertyValue(i) {
        let o = Ga(i);
        if (e._runtimeDataModel.models[o] !== void 0) return uo(e, o);
        if (e._runtimeDataModel.models[i] !== void 0) return uo(e, i);
      }, getPropertyDescriptor(i) {
        if (!t.includes(i)) return { enumerable: false };
      } });
    }
    __name(Mm, "Mm");
    function Qa(e) {
      return e[co] ? e[co] : e;
    }
    __name(Qa, "Qa");
    function Wa(e) {
      if (typeof e == "function") return e(this);
      if (e.client?.__AccelerateEngine) {
        let t = e.client.__AccelerateEngine;
        this._originalClient._engine = new t(this._originalClient._accelerateEngineConfig);
      }
      let r = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e) }, _appliedParent: { value: this, configurable: true }, $on: { value: void 0 } });
      return Pt(r);
    }
    __name(Wa, "Wa");
    function Ja({ result: e, modelName: r, select: t, omit: n, extensions: i }) {
      let o = i.getAllComputedFields(r);
      if (!o) return e;
      let s = [], a = [];
      for (let l of Object.values(o)) {
        if (n) {
          if (n[l.name]) continue;
          let u = l.needs.filter((c) => n[c]);
          u.length > 0 && a.push(Fr(u));
        } else if (t) {
          if (!t[l.name]) continue;
          let u = l.needs.filter((c) => !t[c]);
          u.length > 0 && a.push(Fr(u));
        }
        $m(e, l.needs) && s.push(qm(l, he(e, s)));
      }
      return s.length > 0 || a.length > 0 ? he(e, [...s, ...a]) : e;
    }
    __name(Ja, "Ja");
    function $m(e, r) {
      return r.every((t) => Vi(e, t));
    }
    __name($m, "$m");
    function qm(e, r) {
      return lr(re(e.name, () => e.compute(r)));
    }
    __name(qm, "qm");
    function Gn({ visitor: e, result: r, args: t, runtimeDataModel: n, modelName: i }) {
      if (Array.isArray(r)) {
        for (let s = 0; s < r.length; s++) r[s] = Gn({ result: r[s], args: t, modelName: i, runtimeDataModel: n, visitor: e });
        return r;
      }
      let o = e(r, i, t) ?? r;
      return t.include && Ka({ includeOrSelect: t.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), t.select && Ka({ includeOrSelect: t.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: e }), o;
    }
    __name(Gn, "Gn");
    function Ka({ includeOrSelect: e, result: r, parentModelName: t, runtimeDataModel: n, visitor: i }) {
      for (let [o, s] of Object.entries(e)) {
        if (!s || r[o] == null || Se(s)) continue;
        let l = n.models[t].fields.find((c) => c.name === o);
        if (!l || l.kind !== "object" || !l.relationName) continue;
        let u = typeof s == "object" ? s : {};
        r[o] = Gn({ visitor: i, result: r[o], args: u, modelName: l.type, runtimeDataModel: n });
      }
    }
    __name(Ka, "Ka");
    function Ha({ result: e, modelName: r, args: t, extensions: n, runtimeDataModel: i, globalOmit: o }) {
      return n.isEmpty() || e == null || typeof e != "object" || !i.models[r] ? e : Gn({ result: e, args: t ?? {}, modelName: r, runtimeDataModel: i, visitor: /* @__PURE__ */ __name((a, l, u) => {
        let c = Te(l);
        return Ja({ result: a, modelName: c, select: u.select, omit: u.select ? void 0 : { ...o?.[c], ...u.omit }, extensions: n });
      }, "visitor") });
    }
    __name(Ha, "Ha");
    var Vm = ["$connect", "$disconnect", "$on", "$transaction", "$extends"];
    var Ya = Vm;
    function za(e) {
      if (e instanceof ie) return jm(e);
      if (Vn(e)) return Bm(e);
      if (Array.isArray(e)) {
        let t = [e[0]];
        for (let n = 1; n < e.length; n++) t[n] = Tt(e[n]);
        return t;
      }
      let r = {};
      for (let t in e) r[t] = Tt(e[t]);
      return r;
    }
    __name(za, "za");
    function jm(e) {
      return new ie(e.strings, e.values);
    }
    __name(jm, "jm");
    function Bm(e) {
      return new wt(e.sql, e.values);
    }
    __name(Bm, "Bm");
    function Tt(e) {
      if (typeof e != "object" || e == null || e instanceof Me || kr(e)) return e;
      if (Sr(e)) return new Fe(e.toFixed());
      if (vr(e)) return /* @__PURE__ */ new Date(+e);
      if (ArrayBuffer.isView(e)) return e.slice(0);
      if (Array.isArray(e)) {
        let r = e.length, t;
        for (t = Array(r); r--; ) t[r] = Tt(e[r]);
        return t;
      }
      if (typeof e == "object") {
        let r = {};
        for (let t in e) t === "__proto__" ? Object.defineProperty(r, t, { value: Tt(e[t]), configurable: true, enumerable: true, writable: true }) : r[t] = Tt(e[t]);
        return r;
      }
      ar(e, "Unknown value");
    }
    __name(Tt, "Tt");
    function Xa(e, r, t, n = 0) {
      return e._createPrismaPromise((i) => {
        let o = r.customDataProxyFetch;
        return "transaction" in r && i !== void 0 && (r.transaction?.kind === "batch" && r.transaction.lock.then(), r.transaction = i), n === t.length ? e._executeRequest(r) : t[n]({ model: r.model, operation: r.model ? r.action : r.clientMethod, args: za(r.args ?? {}), __internalParams: r, query: /* @__PURE__ */ __name((s, a = r) => {
          let l = a.customDataProxyFetch;
          return a.customDataProxyFetch = nl(o, l), a.args = s, Xa(e, a, t, n + 1);
        }, "query") });
      });
    }
    __name(Xa, "Xa");
    function el(e, r) {
      let { jsModelName: t, action: n, clientMethod: i } = r, o = t ? n : i;
      if (e._extensions.isEmpty()) return e._executeRequest(r);
      let s = e._extensions.getAllQueryCallbacks(t ?? "$none", o);
      return Xa(e, r, s);
    }
    __name(el, "el");
    function rl(e) {
      return (r) => {
        let t = { requests: r }, n = r[0].extensions.getAllBatchQueryCallbacks();
        return n.length ? tl(t, n, 0, e) : e(t);
      };
    }
    __name(rl, "rl");
    function tl(e, r, t, n) {
      if (t === r.length) return n(e);
      let i = e.customDataProxyFetch, o = e.requests[0].transaction;
      return r[t]({ args: { queries: e.requests.map((s) => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: e, query(s, a = e) {
        let l = a.customDataProxyFetch;
        return a.customDataProxyFetch = nl(i, l), tl(a, r, t + 1, n);
      } });
    }
    __name(tl, "tl");
    var Za = /* @__PURE__ */ __name((e) => e, "Za");
    function nl(e = Za, r = Za) {
      return (t) => e(r(t));
    }
    __name(nl, "nl");
    var il = N("prisma:client");
    var ol = { Vercel: "vercel", "Netlify CI": "netlify" };
    function sl({ postinstall: e, ciName: r, clientVersion: t, generator: n }) {
      if (il("checkPlatformCaching:postinstall", e), il("checkPlatformCaching:ciName", r), e === true && !(n?.output && typeof (n.output.fromEnvVar ?? n.output.value) == "string") && r && r in ol) {
        let i = `Prisma has detected that this project was built on ${r}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${ol[r]}-build`;
        throw console.error(i), new P(i, t);
      }
    }
    __name(sl, "sl");
    function al(e, r) {
      return e ? e.datasources ? e.datasources : e.datasourceUrl ? { [r[0]]: { url: e.datasourceUrl } } : {} : {};
    }
    __name(al, "al");
    var dl = O(__require("node:fs"));
    var St = O(__require("node:path"));
    function Qn(e) {
      let { runtimeBinaryTarget: r } = e;
      return `Add "${r}" to \`binaryTargets\` in the "schema.prisma" file and run \`prisma generate\` after saving it:

${Um(e)}`;
    }
    __name(Qn, "Qn");
    function Um(e) {
      let { generator: r, generatorBinaryTargets: t, runtimeBinaryTarget: n } = e, i = { fromEnvVar: null, value: n }, o = [...t, i];
      return ki({ ...r, binaryTargets: o });
    }
    __name(Um, "Um");
    function Xe(e) {
      let { runtimeBinaryTarget: r } = e;
      return `Prisma Client could not locate the Query Engine for runtime "${r}".`;
    }
    __name(Xe, "Xe");
    function er(e) {
      let { searchedLocations: r } = e;
      return `The following locations have been searched:
${[...new Set(r)].map((i) => `  ${i}`).join(`
`)}`;
    }
    __name(er, "er");
    function ll(e) {
      let { runtimeBinaryTarget: r } = e;
      return `${Xe(e)}

This happened because \`binaryTargets\` have been pinned, but the actual deployment also required "${r}".
${Qn(e)}

${er(e)}`;
    }
    __name(ll, "ll");
    function Wn(e) {
      return `We would appreciate if you could take the time to share some information with us.
Please help us by answering a few questions: https://pris.ly/${e}`;
    }
    __name(Wn, "Wn");
    function Jn(e) {
      let { errorStack: r } = e;
      return r?.match(/\/\.next|\/next@|\/next\//) ? `

We detected that you are using Next.js, learn how to fix this: https://pris.ly/d/engine-not-found-nextjs.` : "";
    }
    __name(Jn, "Jn");
    function ul(e) {
      let { queryEngineName: r } = e;
      return `${Xe(e)}${Jn(e)}

This is likely caused by a bundler that has not copied "${r}" next to the resulting bundle.
Ensure that "${r}" has been copied next to the bundle or in "${e.expectedLocation}".

${Wn("engine-not-found-bundler-investigation")}

${er(e)}`;
    }
    __name(ul, "ul");
    function cl(e) {
      let { runtimeBinaryTarget: r, generatorBinaryTargets: t } = e, n = t.find((i) => i.native);
      return `${Xe(e)}

This happened because Prisma Client was generated for "${n?.value ?? "unknown"}", but the actual deployment required "${r}".
${Qn(e)}

${er(e)}`;
    }
    __name(cl, "cl");
    function pl(e) {
      let { queryEngineName: r } = e;
      return `${Xe(e)}${Jn(e)}

This is likely caused by tooling that has not copied "${r}" to the deployment folder.
Ensure that you ran \`prisma generate\` and that "${r}" has been copied to "${e.expectedLocation}".

${Wn("engine-not-found-tooling-investigation")}

${er(e)}`;
    }
    __name(pl, "pl");
    var Gm = N("prisma:client:engines:resolveEnginePath");
    var Qm = /* @__PURE__ */ __name(() => new RegExp("runtime[\\\\/]library\\.m?js$"), "Qm");
    async function ml(e, r) {
      let t = { binary: process.env.PRISMA_QUERY_ENGINE_BINARY, library: process.env.PRISMA_QUERY_ENGINE_LIBRARY }[e] ?? r.prismaPath;
      if (t !== void 0) return t;
      let { enginePath: n, searchedLocations: i } = await Wm(e, r);
      if (Gm("enginePath", n), n !== void 0 && e === "binary" && Ri(n), n !== void 0) return r.prismaPath = n;
      let o = await ir(), s = r.generator?.binaryTargets ?? [], a = s.some((d) => d.native), l = !s.some((d) => d.value === o), u = __filename.match(Qm()) === null, c = { searchedLocations: i, generatorBinaryTargets: s, generator: r.generator, runtimeBinaryTarget: o, queryEngineName: fl(e, o), expectedLocation: St.default.relative(process.cwd(), r.dirname), errorStack: new Error().stack }, p;
      throw a && l ? p = cl(c) : l ? p = ll(c) : u ? p = ul(c) : p = pl(c), new P(p, r.clientVersion);
    }
    __name(ml, "ml");
    async function Wm(e, r) {
      let t = await ir(), n = [], i = [r.dirname, St.default.resolve(__dirname, ".."), r.generator?.output?.value ?? __dirname, St.default.resolve(__dirname, "../../../.prisma/client"), "/tmp/prisma-engines", r.cwd];
      __filename.includes("resolveEnginePath") && i.push(ms());
      for (let o of i) {
        let s = fl(e, t), a = St.default.join(o, s);
        if (n.push(o), dl.default.existsSync(a)) return { enginePath: a, searchedLocations: n };
      }
      return { enginePath: void 0, searchedLocations: n };
    }
    __name(Wm, "Wm");
    function fl(e, r) {
      return e === "library" ? Gt(r, "fs") : `query-engine-${r}${r === "windows" ? ".exe" : ""}`;
    }
    __name(fl, "fl");
    function gl(e) {
      return e ? e.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (r) => `${r[0]}5`) : "";
    }
    __name(gl, "gl");
    function hl(e) {
      return e.split(`
`).map((r) => r.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
    }
    __name(hl, "hl");
    var yl = O(Os());
    function bl({ title: e, user: r = "prisma", repo: t = "prisma", template: n = "bug_report.yml", body: i }) {
      return (0, yl.default)({ user: r, repo: t, template: n, title: e, body: i });
    }
    __name(bl, "bl");
    function El({ version: e, binaryTarget: r, title: t, description: n, engineVersion: i, database: o, query: s }) {
      let a = Bo(6e3 - (s?.length ?? 0)), l = hl(wr(a)), u = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", c = wr(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${process.version?.padEnd(19)}| 
| OS              | ${r?.padEnd(19)}|
| Prisma Client   | ${e?.padEnd(19)}|
| Query Engine    | ${i?.padEnd(19)}|
| Database        | ${o?.padEnd(19)}|

${u}

## Logs
\`\`\`
${l}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s ? gl(s) : ""}
\`\`\`
`), p = bl({ title: t, body: c });
      return `${t}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${Y(p)}

If you want the Prisma team to look into it, please open the link above 🙏
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
    }
    __name(El, "El");
    function wl(e, r) {
      throw new Error(r);
    }
    __name(wl, "wl");
    function Jm(e) {
      return e !== null && typeof e == "object" && typeof e.$type == "string";
    }
    __name(Jm, "Jm");
    function Km(e, r) {
      let t = {};
      for (let n of Object.keys(e)) t[n] = r(e[n], n);
      return t;
    }
    __name(Km, "Km");
    function Vr(e) {
      return e === null ? e : Array.isArray(e) ? e.map(Vr) : typeof e == "object" ? Jm(e) ? Hm(e) : e.constructor !== null && e.constructor.name !== "Object" ? e : Km(e, Vr) : e;
    }
    __name(Vr, "Vr");
    function Hm({ $type: e, value: r }) {
      switch (e) {
        case "BigInt":
          return BigInt(r);
        case "Bytes": {
          let { buffer: t, byteOffset: n, byteLength: i } = Buffer.from(r, "base64");
          return new Uint8Array(t, n, i);
        }
        case "DateTime":
          return new Date(r);
        case "Decimal":
          return new Le(r);
        case "Json":
          return JSON.parse(r);
        default:
          wl(r, "Unknown tagged value");
      }
    }
    __name(Hm, "Hm");
    var xl = "6.19.3";
    var zm = /* @__PURE__ */ __name(() => globalThis.process?.release?.name === "node", "zm");
    var Zm = /* @__PURE__ */ __name(() => !!globalThis.Bun || !!globalThis.process?.versions?.bun, "Zm");
    var Xm = /* @__PURE__ */ __name(() => !!globalThis.Deno, "Xm");
    var ef = /* @__PURE__ */ __name(() => typeof globalThis.Netlify == "object", "ef");
    var rf = /* @__PURE__ */ __name(() => typeof globalThis.EdgeRuntime == "object", "rf");
    var tf = /* @__PURE__ */ __name(() => globalThis.navigator?.userAgent === "Cloudflare-Workers", "tf");
    function nf() {
      return [[ef, "netlify"], [rf, "edge-light"], [tf, "workerd"], [Xm, "deno"], [Zm, "bun"], [zm, "node"]].flatMap((t) => t[0]() ? [t[1]] : []).at(0) ?? "";
    }
    __name(nf, "nf");
    var of = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
    function Kn() {
      let e = nf();
      return { id: e, prettyName: of[e] || e, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e) };
    }
    __name(Kn, "Kn");
    function jr({ inlineDatasources: e, overrideDatasources: r, env: t, clientVersion: n }) {
      let i, o = Object.keys(e)[0], s = e[o]?.url, a = r[o]?.url;
      if (o === void 0 ? i = void 0 : a ? i = a : s?.value ? i = s.value : s?.fromEnvVar && (i = t[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0) throw new P(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
      if (i === void 0) throw new P("error: Missing URL environment variable, value, or override.", n);
      return i;
    }
    __name(jr, "jr");
    var Hn = class extends Error {
      static {
        __name(this, "Hn");
      }
      clientVersion;
      cause;
      constructor(r, t) {
        super(r), this.clientVersion = t.clientVersion, this.cause = t.cause;
      }
      get [Symbol.toStringTag]() {
        return this.name;
      }
    };
    var oe = class extends Hn {
      static {
        __name(this, "oe");
      }
      isRetryable;
      constructor(r, t) {
        super(r, t), this.isRetryable = t.isRetryable ?? true;
      }
    };
    function R(e, r) {
      return { ...e, isRetryable: r };
    }
    __name(R, "R");
    var ur = class extends oe {
      static {
        __name(this, "ur");
      }
      name = "InvalidDatasourceError";
      code = "P6001";
      constructor(r, t) {
        super(r, R(t, false));
      }
    };
    x(ur, "InvalidDatasourceError");
    function vl(e) {
      let r = { clientVersion: e.clientVersion }, t = Object.keys(e.inlineDatasources)[0], n = jr({ inlineDatasources: e.inlineDatasources, overrideDatasources: e.overrideDatasources, clientVersion: e.clientVersion, env: { ...e.env, ...typeof process < "u" ? process.env : {} } }), i;
      try {
        i = new URL(n);
      } catch {
        throw new ur(`Error validating datasource \`${t}\`: the URL must start with the protocol \`prisma://\``, r);
      }
      let { protocol: o, searchParams: s } = i;
      if (o !== "prisma:" && o !== sn) throw new ur(`Error validating datasource \`${t}\`: the URL must start with the protocol \`prisma://\` or \`prisma+postgres://\``, r);
      let a = s.get("api_key");
      if (a === null || a.length < 1) throw new ur(`Error validating datasource \`${t}\`: the URL must contain a valid API key`, r);
      let l = Ii(i) ? "http:" : "https:";
      process.env.TEST_CLIENT_ENGINE_REMOTE_EXECUTOR && i.searchParams.has("use_http") && (l = "http:");
      let u = new URL(i.href.replace(o, l));
      return { apiKey: a, url: u };
    }
    __name(vl, "vl");
    var Pl = O(on());
    var Yn = class {
      static {
        __name(this, "Yn");
      }
      apiKey;
      tracingHelper;
      logLevel;
      logQueries;
      engineHash;
      constructor({ apiKey: r, tracingHelper: t, logLevel: n, logQueries: i, engineHash: o }) {
        this.apiKey = r, this.tracingHelper = t, this.logLevel = n, this.logQueries = i, this.engineHash = o;
      }
      build({ traceparent: r, transactionId: t } = {}) {
        let n = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": Pl.enginesVersion };
        this.tracingHelper.isEnabled() && (n.traceparent = r ?? this.tracingHelper.getTraceParent()), t && (n["X-Transaction-Id"] = t);
        let i = this.#e();
        return i.length > 0 && (n["X-Capture-Telemetry"] = i.join(", ")), n;
      }
      #e() {
        let r = [];
        return this.tracingHelper.isEnabled() && r.push("tracing"), this.logLevel && r.push(this.logLevel), this.logQueries && r.push("query"), r;
      }
    };
    function sf(e) {
      return e[0] * 1e3 + e[1] / 1e6;
    }
    __name(sf, "sf");
    function po(e) {
      return new Date(sf(e));
    }
    __name(po, "po");
    var Br = class extends oe {
      static {
        __name(this, "Br");
      }
      name = "ForcedRetryError";
      code = "P5001";
      constructor(r) {
        super("This request must be retried", R(r, true));
      }
    };
    x(Br, "ForcedRetryError");
    var cr = class extends oe {
      static {
        __name(this, "cr");
      }
      name = "NotImplementedYetError";
      code = "P5004";
      constructor(r, t) {
        super(r, R(t, false));
      }
    };
    x(cr, "NotImplementedYetError");
    var $2 = class extends oe {
      static {
        __name(this, "$");
      }
      response;
      constructor(r, t) {
        super(r, t), this.response = t.response;
        let n = this.response.headers.get("prisma-request-id");
        if (n) {
          let i = `(The request id was: ${n})`;
          this.message = this.message + " " + i;
        }
      }
    };
    var pr = class extends $2 {
      static {
        __name(this, "pr");
      }
      name = "SchemaMissingError";
      code = "P5005";
      constructor(r) {
        super("Schema needs to be uploaded", R(r, true));
      }
    };
    x(pr, "SchemaMissingError");
    var mo = "This request could not be understood by the server";
    var Rt = class extends $2 {
      static {
        __name(this, "Rt");
      }
      name = "BadRequestError";
      code = "P5000";
      constructor(r, t, n) {
        super(t || mo, R(r, false)), n && (this.code = n);
      }
    };
    x(Rt, "BadRequestError");
    var At = class extends $2 {
      static {
        __name(this, "At");
      }
      name = "HealthcheckTimeoutError";
      code = "P5013";
      logs;
      constructor(r, t) {
        super("Engine not started: healthcheck timeout", R(r, true)), this.logs = t;
      }
    };
    x(At, "HealthcheckTimeoutError");
    var Ct = class extends $2 {
      static {
        __name(this, "Ct");
      }
      name = "EngineStartupError";
      code = "P5014";
      logs;
      constructor(r, t, n) {
        super(t, R(r, true)), this.logs = n;
      }
    };
    x(Ct, "EngineStartupError");
    var It = class extends $2 {
      static {
        __name(this, "It");
      }
      name = "EngineVersionNotSupportedError";
      code = "P5012";
      constructor(r) {
        super("Engine version is not supported", R(r, false));
      }
    };
    x(It, "EngineVersionNotSupportedError");
    var fo = "Request timed out";
    var Dt = class extends $2 {
      static {
        __name(this, "Dt");
      }
      name = "GatewayTimeoutError";
      code = "P5009";
      constructor(r, t = fo) {
        super(t, R(r, false));
      }
    };
    x(Dt, "GatewayTimeoutError");
    var af = "Interactive transaction error";
    var Ot = class extends $2 {
      static {
        __name(this, "Ot");
      }
      name = "InteractiveTransactionError";
      code = "P5015";
      constructor(r, t = af) {
        super(t, R(r, false));
      }
    };
    x(Ot, "InteractiveTransactionError");
    var lf = "Request parameters are invalid";
    var kt = class extends $2 {
      static {
        __name(this, "kt");
      }
      name = "InvalidRequestError";
      code = "P5011";
      constructor(r, t = lf) {
        super(t, R(r, false));
      }
    };
    x(kt, "InvalidRequestError");
    var go = "Requested resource does not exist";
    var _t = class extends $2 {
      static {
        __name(this, "_t");
      }
      name = "NotFoundError";
      code = "P5003";
      constructor(r, t = go) {
        super(t, R(r, false));
      }
    };
    x(_t, "NotFoundError");
    var ho = "Unknown server error";
    var Ur = class extends $2 {
      static {
        __name(this, "Ur");
      }
      name = "ServerError";
      code = "P5006";
      logs;
      constructor(r, t, n) {
        super(t || ho, R(r, true)), this.logs = n;
      }
    };
    x(Ur, "ServerError");
    var yo = "Unauthorized, check your connection string";
    var Nt = class extends $2 {
      static {
        __name(this, "Nt");
      }
      name = "UnauthorizedError";
      code = "P5007";
      constructor(r, t = yo) {
        super(t, R(r, false));
      }
    };
    x(Nt, "UnauthorizedError");
    var bo = "Usage exceeded, retry again later";
    var Lt = class extends $2 {
      static {
        __name(this, "Lt");
      }
      name = "UsageExceededError";
      code = "P5008";
      constructor(r, t = bo) {
        super(t, R(r, true));
      }
    };
    x(Lt, "UsageExceededError");
    async function uf(e) {
      let r;
      try {
        r = await e.text();
      } catch {
        return { type: "EmptyError" };
      }
      try {
        let t = JSON.parse(r);
        if (typeof t == "string") switch (t) {
          case "InternalDataProxyError":
            return { type: "DataProxyError", body: t };
          default:
            return { type: "UnknownTextError", body: t };
        }
        if (typeof t == "object" && t !== null) {
          if ("is_panic" in t && "message" in t && "error_code" in t) return { type: "QueryEngineError", body: t };
          if ("EngineNotStarted" in t || "InteractiveTransactionMisrouted" in t || "InvalidRequestError" in t) {
            let n = Object.values(t)[0].reason;
            return typeof n == "string" && !["SchemaMissing", "EngineVersionNotSupported"].includes(n) ? { type: "UnknownJsonError", body: t } : { type: "DataProxyError", body: t };
          }
        }
        return { type: "UnknownJsonError", body: t };
      } catch {
        return r === "" ? { type: "EmptyError" } : { type: "UnknownTextError", body: r };
      }
    }
    __name(uf, "uf");
    async function Ft(e, r) {
      if (e.ok) return;
      let t = { clientVersion: r, response: e }, n = await uf(e);
      if (n.type === "QueryEngineError") throw new z(n.body.message, { code: n.body.error_code, clientVersion: r });
      if (n.type === "DataProxyError") {
        if (n.body === "InternalDataProxyError") throw new Ur(t, "Internal Data Proxy error");
        if ("EngineNotStarted" in n.body) {
          if (n.body.EngineNotStarted.reason === "SchemaMissing") return new pr(t);
          if (n.body.EngineNotStarted.reason === "EngineVersionNotSupported") throw new It(t);
          if ("EngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, logs: o } = n.body.EngineNotStarted.reason.EngineStartupError;
            throw new Ct(t, i, o);
          }
          if ("KnownEngineStartupError" in n.body.EngineNotStarted.reason) {
            let { msg: i, error_code: o } = n.body.EngineNotStarted.reason.KnownEngineStartupError;
            throw new P(i, r, o);
          }
          if ("HealthcheckTimeout" in n.body.EngineNotStarted.reason) {
            let { logs: i } = n.body.EngineNotStarted.reason.HealthcheckTimeout;
            throw new At(t, i);
          }
        }
        if ("InteractiveTransactionMisrouted" in n.body) {
          let i = { IDParseError: "Could not parse interactive transaction ID", NoQueryEngineFoundError: "Could not find Query Engine for the specified host and transaction ID", TransactionStartError: "Could not start interactive transaction" };
          throw new Ot(t, i[n.body.InteractiveTransactionMisrouted.reason]);
        }
        if ("InvalidRequestError" in n.body) throw new kt(t, n.body.InvalidRequestError.reason);
      }
      if (e.status === 401 || e.status === 403) throw new Nt(t, Gr(yo, n));
      if (e.status === 404) return new _t(t, Gr(go, n));
      if (e.status === 429) throw new Lt(t, Gr(bo, n));
      if (e.status === 504) throw new Dt(t, Gr(fo, n));
      if (e.status >= 500) throw new Ur(t, Gr(ho, n));
      if (e.status >= 400) throw new Rt(t, Gr(mo, n));
    }
    __name(Ft, "Ft");
    function Gr(e, r) {
      return r.type === "EmptyError" ? e : `${e}: ${JSON.stringify(r)}`;
    }
    __name(Gr, "Gr");
    function Tl(e) {
      let r = Math.pow(2, e) * 50, t = Math.ceil(Math.random() * r) - Math.ceil(r / 2), n = r + t;
      return new Promise((i) => setTimeout(() => i(n), n));
    }
    __name(Tl, "Tl");
    var $e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    function Sl(e) {
      let r = new TextEncoder().encode(e), t = "", n = r.byteLength, i = n % 3, o = n - i, s, a, l, u, c;
      for (let p = 0; p < o; p = p + 3) c = r[p] << 16 | r[p + 1] << 8 | r[p + 2], s = (c & 16515072) >> 18, a = (c & 258048) >> 12, l = (c & 4032) >> 6, u = c & 63, t += $e[s] + $e[a] + $e[l] + $e[u];
      return i == 1 ? (c = r[o], s = (c & 252) >> 2, a = (c & 3) << 4, t += $e[s] + $e[a] + "==") : i == 2 && (c = r[o] << 8 | r[o + 1], s = (c & 64512) >> 10, a = (c & 1008) >> 4, l = (c & 15) << 2, t += $e[s] + $e[a] + $e[l] + "="), t;
    }
    __name(Sl, "Sl");
    function Rl(e) {
      if (!!e.generator?.previewFeatures.some((t) => t.toLowerCase().includes("metrics"))) throw new P("The `metrics` preview feature is not yet available with Accelerate.\nPlease remove `metrics` from the `previewFeatures` in your schema.\n\nMore information about Accelerate: https://pris.ly/d/accelerate", e.clientVersion);
    }
    __name(Rl, "Rl");
    var Al = { "@prisma/debug": "workspace:*", "@prisma/engines-version": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/fetch-engine": "workspace:*", "@prisma/get-platform": "workspace:*" };
    var Mt = class extends oe {
      static {
        __name(this, "Mt");
      }
      name = "RequestError";
      code = "P5010";
      constructor(r, t) {
        super(`Cannot fetch data from service:
${r}`, R(t, true));
      }
    };
    x(Mt, "RequestError");
    async function dr(e, r, t = (n) => n) {
      let { clientVersion: n, ...i } = r, o = t(fetch);
      try {
        return await o(e, i);
      } catch (s) {
        let a = s.message ?? "Unknown error";
        throw new Mt(a, { clientVersion: n, cause: s });
      }
    }
    __name(dr, "dr");
    var pf = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
    var Cl = N("prisma:client:dataproxyEngine");
    async function df(e, r) {
      let t = Al["@prisma/engines-version"], n = r.clientVersion ?? "unknown";
      if (process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION) return process.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION;
      if (e.includes("accelerate") && n !== "0.0.0" && n !== "in-memory") return n;
      let [i, o] = n?.split("-") ?? [];
      if (o === void 0 && pf.test(i)) return i;
      if (o !== void 0 || n === "0.0.0" || n === "in-memory") {
        let [s] = t.split("-") ?? [], [a, l, u] = s.split("."), c = mf(`<=${a}.${l}.${u}`), p = await dr(c, { clientVersion: n });
        if (!p.ok) throw new Error(`Failed to fetch stable Prisma version, unpkg.com status ${p.status} ${p.statusText}, response body: ${await p.text() || "<empty body>"}`);
        let d = await p.text();
        Cl("length of body fetched from unpkg.com", d.length);
        let f;
        try {
          f = JSON.parse(d);
        } catch (h) {
          throw console.error("JSON.parse error: body fetched from unpkg.com: ", d), h;
        }
        return f.version;
      }
      throw new cr("Only `major.minor.patch` versions are supported by Accelerate.", { clientVersion: n });
    }
    __name(df, "df");
    async function Il(e, r) {
      let t = await df(e, r);
      return Cl("version", t), t;
    }
    __name(Il, "Il");
    function mf(e) {
      return encodeURI(`https://unpkg.com/prisma@${e}/package.json`);
    }
    __name(mf, "mf");
    var Dl = 3;
    var $t = N("prisma:client:dataproxyEngine");
    var qt = class {
      static {
        __name(this, "qt");
      }
      name = "DataProxyEngine";
      inlineSchema;
      inlineSchemaHash;
      inlineDatasources;
      config;
      logEmitter;
      env;
      clientVersion;
      engineHash;
      tracingHelper;
      remoteClientVersion;
      host;
      headerBuilder;
      startPromise;
      protocol;
      constructor(r) {
        Rl(r), this.config = r, this.env = r.env, this.inlineSchema = Sl(r.inlineSchema), this.inlineDatasources = r.inlineDatasources, this.inlineSchemaHash = r.inlineSchemaHash, this.clientVersion = r.clientVersion, this.engineHash = r.engineVersion, this.logEmitter = r.logEmitter, this.tracingHelper = r.tracingHelper;
      }
      apiKey() {
        return this.headerBuilder.apiKey;
      }
      version() {
        return this.engineHash;
      }
      async start() {
        this.startPromise !== void 0 && await this.startPromise, this.startPromise = (async () => {
          let { apiKey: r, url: t } = this.getURLAndAPIKey();
          this.host = t.host, this.protocol = t.protocol, this.headerBuilder = new Yn({ apiKey: r, tracingHelper: this.tracingHelper, logLevel: this.config.logLevel ?? "error", logQueries: this.config.logQueries, engineHash: this.engineHash }), this.remoteClientVersion = await Il(this.host, this.config), $t("host", this.host), $t("protocol", this.protocol);
        })(), await this.startPromise;
      }
      async stop() {
      }
      propagateResponseExtensions(r) {
        r?.logs?.length && r.logs.forEach((t) => {
          switch (t.level) {
            case "debug":
            case "trace":
              $t(t);
              break;
            case "error":
            case "warn":
            case "info": {
              this.logEmitter.emit(t.level, { timestamp: po(t.timestamp), message: t.attributes.message ?? "", target: t.target ?? "BinaryEngine" });
              break;
            }
            case "query": {
              this.logEmitter.emit("query", { query: t.attributes.query ?? "", timestamp: po(t.timestamp), duration: t.attributes.duration_ms ?? 0, params: t.attributes.params ?? "", target: t.target ?? "BinaryEngine" });
              break;
            }
            default:
              t.level;
          }
        }), r?.traces?.length && this.tracingHelper.dispatchEngineSpans(r.traces);
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the remote query engine');
      }
      async url(r) {
        return await this.start(), `${this.protocol}//${this.host}/${this.remoteClientVersion}/${this.inlineSchemaHash}/${r}`;
      }
      async uploadSchema() {
        let r = { name: "schemaUpload", internal: true };
        return this.tracingHelper.runInChildSpan(r, async () => {
          let t = await dr(await this.url("schema"), { method: "PUT", headers: this.headerBuilder.build(), body: this.inlineSchema, clientVersion: this.clientVersion });
          t.ok || $t("schema response status", t.status);
          let n = await Ft(t, this.clientVersion);
          if (n) throw this.logEmitter.emit("warn", { message: `Error while uploading schema: ${n.message}`, timestamp: /* @__PURE__ */ new Date(), target: "" }), n;
          this.logEmitter.emit("info", { message: `Schema (re)uploaded (hash: ${this.inlineSchemaHash})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
        });
      }
      request(r, { traceparent: t, interactiveTransaction: n, customDataProxyFetch: i }) {
        return this.requestInternal({ body: r, traceparent: t, interactiveTransaction: n, customDataProxyFetch: i });
      }
      async requestBatch(r, { traceparent: t, transaction: n, customDataProxyFetch: i }) {
        let o = n?.kind === "itx" ? n.options : void 0, s = Mr(r, n);
        return (await this.requestInternal({ body: s, customDataProxyFetch: i, interactiveTransaction: o, traceparent: t })).map((l) => (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l ? this.convertProtocolErrorsToClientError(l.errors) : l));
      }
      requestInternal({ body: r, traceparent: t, customDataProxyFetch: n, interactiveTransaction: i }) {
        return this.withRetry({ actionGerund: "querying", callback: /* @__PURE__ */ __name(async ({ logHttpCall: o }) => {
          let s = i ? `${i.payload.endpoint}/graphql` : await this.url("graphql");
          o(s);
          let a = await dr(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: t, transactionId: i?.id }), body: JSON.stringify(r), clientVersion: this.clientVersion }, n);
          a.ok || $t("graphql response status", a.status), await this.handleError(await Ft(a, this.clientVersion));
          let l = await a.json();
          if (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l) throw this.convertProtocolErrorsToClientError(l.errors);
          return "batchResult" in l ? l.batchResult : l;
        }, "callback") });
      }
      async transaction(r, t, n) {
        let i = { start: "starting", commit: "committing", rollback: "rolling back" };
        return this.withRetry({ actionGerund: `${i[r]} transaction`, callback: /* @__PURE__ */ __name(async ({ logHttpCall: o }) => {
          if (r === "start") {
            let s = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel }), a = await this.url("transaction/start");
            o(a);
            let l = await dr(a, { method: "POST", headers: this.headerBuilder.build({ traceparent: t.traceparent }), body: s, clientVersion: this.clientVersion });
            await this.handleError(await Ft(l, this.clientVersion));
            let u = await l.json(), { extensions: c } = u;
            c && this.propagateResponseExtensions(c);
            let p = u.id, d = u["data-proxy"].endpoint;
            return { id: p, payload: { endpoint: d } };
          } else {
            let s = `${n.payload.endpoint}/${r}`;
            o(s);
            let a = await dr(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: t.traceparent }), clientVersion: this.clientVersion });
            await this.handleError(await Ft(a, this.clientVersion));
            let l = await a.json(), { extensions: u } = l;
            u && this.propagateResponseExtensions(u);
            return;
          }
        }, "callback") });
      }
      getURLAndAPIKey() {
        return vl({ clientVersion: this.clientVersion, env: this.env, inlineDatasources: this.inlineDatasources, overrideDatasources: this.config.overrideDatasources });
      }
      metrics() {
        throw new cr("Metrics are not yet supported for Accelerate", { clientVersion: this.clientVersion });
      }
      async withRetry(r) {
        for (let t = 0; ; t++) {
          let n = /* @__PURE__ */ __name((i) => {
            this.logEmitter.emit("info", { message: `Calling ${i} (n=${t})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          }, "n");
          try {
            return await r.callback({ logHttpCall: n });
          } catch (i) {
            if (!(i instanceof oe) || !i.isRetryable) throw i;
            if (t >= Dl) throw i instanceof Br ? i.cause : i;
            this.logEmitter.emit("warn", { message: `Attempt ${t + 1}/${Dl} failed for ${r.actionGerund}: ${i.message ?? "(unknown)"}`, timestamp: /* @__PURE__ */ new Date(), target: "" });
            let o = await Tl(t);
            this.logEmitter.emit("warn", { message: `Retrying after ${o}ms`, timestamp: /* @__PURE__ */ new Date(), target: "" });
          }
        }
      }
      async handleError(r) {
        if (r instanceof pr) throw await this.uploadSchema(), new Br({ clientVersion: this.clientVersion, cause: r });
        if (r) throw r;
      }
      convertProtocolErrorsToClientError(r) {
        return r.length === 1 ? $r(r[0], this.config.clientVersion, this.config.activeProvider) : new V(JSON.stringify(r), { clientVersion: this.config.clientVersion });
      }
      applyPendingMigrations() {
        throw new Error("Method not implemented.");
      }
    };
    function Ol(e) {
      if (e?.kind === "itx") return e.options.id;
    }
    __name(Ol, "Ol");
    var wo = O(__require("node:os"));
    var kl = O(__require("node:path"));
    var Eo = Symbol("PrismaLibraryEngineCache");
    function ff() {
      let e = globalThis;
      return e[Eo] === void 0 && (e[Eo] = {}), e[Eo];
    }
    __name(ff, "ff");
    function gf(e) {
      let r = ff();
      if (r[e] !== void 0) return r[e];
      let t = kl.default.toNamespacedPath(e), n = { exports: {} }, i = 0;
      return process.platform !== "win32" && (i = wo.default.constants.dlopen.RTLD_LAZY | wo.default.constants.dlopen.RTLD_DEEPBIND), process.dlopen(n, t, i), r[e] = n.exports, n.exports;
    }
    __name(gf, "gf");
    var _l = { async loadLibrary(e) {
      let r = await fi(), t = await ml("library", e);
      try {
        return e.tracingHelper.runInChildSpan({ name: "loadLibrary", internal: true }, () => gf(t));
      } catch (n) {
        let i = Ai({ e: n, platformInfo: r, id: t });
        throw new P(i, e.clientVersion);
      }
    } };
    var xo;
    var Nl = { async loadLibrary(e) {
      let { clientVersion: r, adapter: t, engineWasm: n } = e;
      if (t === void 0) throw new P(`The \`adapter\` option for \`PrismaClient\` is required in this context (${Kn().prettyName})`, r);
      if (n === void 0) throw new P("WASM engine was unexpectedly `undefined`", r);
      xo === void 0 && (xo = (async () => {
        let o = await n.getRuntime(), s = await n.getQueryEngineWasmModule();
        if (s == null) throw new P("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", r);
        let a = { "./query_engine_bg.js": o }, l = new WebAssembly.Instance(s, a), u = l.exports.__wbindgen_start;
        return o.__wbg_set_wasm(l.exports), u(), o.QueryEngine;
      })());
      let i = await xo;
      return { debugPanic() {
        return Promise.reject("{}");
      }, dmmf() {
        return Promise.resolve("{}");
      }, version() {
        return { commit: "unknown", version: "unknown" };
      }, QueryEngine: i };
    } };
    var hf = "P2036";
    var Re = N("prisma:client:libraryEngine");
    function yf(e) {
      return e.item_type === "query" && "query" in e;
    }
    __name(yf, "yf");
    function bf(e) {
      return "level" in e ? e.level === "error" && e.message === "PANIC" : false;
    }
    __name(bf, "bf");
    var Ll = [...li, "native"];
    var Ef = 0xffffffffffffffffn;
    var vo = 1n;
    function wf() {
      let e = vo++;
      return vo > Ef && (vo = 1n), e;
    }
    __name(wf, "wf");
    var Qr = class {
      static {
        __name(this, "Qr");
      }
      name = "LibraryEngine";
      engine;
      libraryInstantiationPromise;
      libraryStartingPromise;
      libraryStoppingPromise;
      libraryStarted;
      executingQueryPromise;
      config;
      QueryEngineConstructor;
      libraryLoader;
      library;
      logEmitter;
      libQueryEnginePath;
      binaryTarget;
      datasourceOverrides;
      datamodel;
      logQueries;
      logLevel;
      lastQuery;
      loggerRustPanic;
      tracingHelper;
      adapterPromise;
      versionInfo;
      constructor(r, t) {
        this.libraryLoader = t ?? _l, r.engineWasm !== void 0 && (this.libraryLoader = t ?? Nl), this.config = r, this.libraryStarted = false, this.logQueries = r.logQueries ?? false, this.logLevel = r.logLevel ?? "error", this.logEmitter = r.logEmitter, this.datamodel = r.inlineSchema, this.tracingHelper = r.tracingHelper, r.enableDebugLogs && (this.logLevel = "debug");
        let n = Object.keys(r.overrideDatasources)[0], i = r.overrideDatasources[n]?.url;
        n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }), this.libraryInstantiationPromise = this.instantiateLibrary();
      }
      wrapEngine(r) {
        return { applyPendingMigrations: r.applyPendingMigrations?.bind(r), commitTransaction: this.withRequestId(r.commitTransaction.bind(r)), connect: this.withRequestId(r.connect.bind(r)), disconnect: this.withRequestId(r.disconnect.bind(r)), metrics: r.metrics?.bind(r), query: this.withRequestId(r.query.bind(r)), rollbackTransaction: this.withRequestId(r.rollbackTransaction.bind(r)), sdlSchema: r.sdlSchema?.bind(r), startTransaction: this.withRequestId(r.startTransaction.bind(r)), trace: r.trace.bind(r), free: r.free?.bind(r) };
      }
      withRequestId(r) {
        return async (...t) => {
          let n = wf().toString();
          try {
            return await r(...t, n);
          } finally {
            if (this.tracingHelper.isEnabled()) {
              let i = await this.engine?.trace(n);
              if (i) {
                let o = JSON.parse(i);
                this.tracingHelper.dispatchEngineSpans(o.spans);
              }
            }
          }
        };
      }
      async applyPendingMigrations() {
        throw new Error("Cannot call this method from this type of engine instance");
      }
      async transaction(r, t, n) {
        await this.start();
        let i = await this.adapterPromise, o = JSON.stringify(t), s;
        if (r === "start") {
          let l = JSON.stringify({ max_wait: n.maxWait, timeout: n.timeout, isolation_level: n.isolationLevel });
          s = await this.engine?.startTransaction(l, o);
        } else r === "commit" ? s = await this.engine?.commitTransaction(n.id, o) : r === "rollback" && (s = await this.engine?.rollbackTransaction(n.id, o));
        let a = this.parseEngineResponse(s);
        if (xf(a)) {
          let l = this.getExternalAdapterError(a, i?.errorRegistry);
          throw l ? l.error : new z(a.message, { code: a.error_code, clientVersion: this.config.clientVersion, meta: a.meta });
        } else if (typeof a.message == "string") throw new V(a.message, { clientVersion: this.config.clientVersion });
        return a;
      }
      async instantiateLibrary() {
        if (Re("internalSetup"), this.libraryInstantiationPromise) return this.libraryInstantiationPromise;
        ai(), this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version();
      }
      async getCurrentBinaryTarget() {
        {
          if (this.binaryTarget) return this.binaryTarget;
          let r = await this.tracingHelper.runInChildSpan("detect_platform", () => ir());
          if (!Ll.includes(r)) throw new P(`Unknown ${ce("PRISMA_QUERY_ENGINE_LIBRARY")} ${ce(W(r))}. Possible binaryTargets: ${qe(Ll.join(", "))} or a path to the query engine library.
You may have to run ${qe("prisma generate")} for your changes to take effect.`, this.config.clientVersion);
          return r;
        }
      }
      parseEngineResponse(r) {
        if (!r) throw new V("Response from the Engine was empty", { clientVersion: this.config.clientVersion });
        try {
          return JSON.parse(r);
        } catch {
          throw new V("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
        }
      }
      async loadEngine() {
        if (!this.engine) {
          this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
          try {
            let r = new WeakRef(this);
            this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(tn));
            let t = await this.adapterPromise;
            t && Re("Using driver adapter: %O", t), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: process.env, logQueries: this.config.logQueries ?? false, ignoreEnvVarErrors: true, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, (n) => {
              r.deref()?.logger(n);
            }, t));
          } catch (r) {
            let t = r, n = this.parseInitError(t.message);
            throw typeof n == "string" ? t : new P(n.message, this.config.clientVersion, n.error_code);
          }
        }
      }
      logger(r) {
        let t = this.parseEngineResponse(r);
        t && (t.level = t?.level.toLowerCase() ?? "unknown", yf(t) ? this.logEmitter.emit("query", { timestamp: /* @__PURE__ */ new Date(), query: t.query, params: t.params, duration: Number(t.duration_ms), target: t.module_path }) : bf(t) ? this.loggerRustPanic = new ae(Po(this, `${t.message}: ${t.reason} in ${t.file}:${t.line}:${t.column}`), this.config.clientVersion) : this.logEmitter.emit(t.level, { timestamp: /* @__PURE__ */ new Date(), message: t.message, target: t.module_path }));
      }
      parseInitError(r) {
        try {
          return JSON.parse(r);
        } catch {
        }
        return r;
      }
      parseRequestError(r) {
        try {
          return JSON.parse(r);
        } catch {
        }
        return r;
      }
      onBeforeExit() {
        throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.');
      }
      async start() {
        if (this.libraryInstantiationPromise || (this.libraryInstantiationPromise = this.instantiateLibrary()), await this.libraryInstantiationPromise, await this.libraryStoppingPromise, this.libraryStartingPromise) return Re(`library already starting, this.libraryStarted: ${this.libraryStarted}`), this.libraryStartingPromise;
        if (this.libraryStarted) return;
        let r = /* @__PURE__ */ __name(async () => {
          Re("library starting");
          try {
            let t = { traceparent: this.tracingHelper.getTraceParent() };
            await this.engine?.connect(JSON.stringify(t)), this.libraryStarted = true, this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(tn)), await this.adapterPromise, Re("library started");
          } catch (t) {
            let n = this.parseInitError(t.message);
            throw typeof n == "string" ? t : new P(n.message, this.config.clientVersion, n.error_code);
          } finally {
            this.libraryStartingPromise = void 0;
          }
        }, "r");
        return this.libraryStartingPromise = this.tracingHelper.runInChildSpan("connect", r), this.libraryStartingPromise;
      }
      async stop() {
        if (await this.libraryInstantiationPromise, await this.libraryStartingPromise, await this.executingQueryPromise, this.libraryStoppingPromise) return Re("library is already stopping"), this.libraryStoppingPromise;
        if (!this.libraryStarted) {
          await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0;
          return;
        }
        let r = /* @__PURE__ */ __name(async () => {
          await new Promise((n) => setImmediate(n)), Re("library stopping");
          let t = { traceparent: this.tracingHelper.getTraceParent() };
          await this.engine?.disconnect(JSON.stringify(t)), this.engine?.free && this.engine.free(), this.engine = void 0, this.libraryStarted = false, this.libraryStoppingPromise = void 0, this.libraryInstantiationPromise = void 0, await (await this.adapterPromise)?.dispose(), this.adapterPromise = void 0, Re("library stopped");
        }, "r");
        return this.libraryStoppingPromise = this.tracingHelper.runInChildSpan("disconnect", r), this.libraryStoppingPromise;
      }
      version() {
        return this.versionInfo = this.library?.version(), this.versionInfo?.version ?? "unknown";
      }
      debugPanic(r) {
        return this.library?.debugPanic(r);
      }
      async request(r, { traceparent: t, interactiveTransaction: n }) {
        Re(`sending request, this.libraryStarted: ${this.libraryStarted}`);
        let i = JSON.stringify({ traceparent: t }), o = JSON.stringify(r);
        try {
          await this.start();
          let s = await this.adapterPromise;
          this.executingQueryPromise = this.engine?.query(o, i, n?.id), this.lastQuery = o;
          let a = this.parseEngineResponse(await this.executingQueryPromise);
          if (a.errors) throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], s?.errorRegistry) : new V(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion });
          if (this.loggerRustPanic) throw this.loggerRustPanic;
          return { data: a };
        } catch (s) {
          if (s instanceof P) throw s;
          if (s.code === "GenericFailure" && s.message?.startsWith("PANIC:")) throw new ae(Po(this, s.message), this.config.clientVersion);
          let a = this.parseRequestError(s.message);
          throw typeof a == "string" ? s : new V(`${a.message}
${a.backtrace}`, { clientVersion: this.config.clientVersion });
        }
      }
      async requestBatch(r, { transaction: t, traceparent: n }) {
        Re("requestBatch");
        let i = Mr(r, t);
        await this.start();
        let o = await this.adapterPromise;
        this.lastQuery = JSON.stringify(i), this.executingQueryPromise = this.engine?.query(this.lastQuery, JSON.stringify({ traceparent: n }), Ol(t));
        let s = await this.executingQueryPromise, a = this.parseEngineResponse(s);
        if (a.errors) throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], o?.errorRegistry) : new V(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion });
        let { batchResult: l, errors: u } = a;
        if (Array.isArray(l)) return l.map((c) => c.errors && c.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(c.errors[0], o?.errorRegistry) : { data: c });
        throw u && u.length === 1 ? new Error(u[0].error) : new Error(JSON.stringify(a));
      }
      buildQueryError(r, t) {
        if (r.user_facing_error.is_panic) return new ae(Po(this, r.user_facing_error.message), this.config.clientVersion);
        let n = this.getExternalAdapterError(r.user_facing_error, t);
        return n ? n.error : $r(r, this.config.clientVersion, this.config.activeProvider);
      }
      getExternalAdapterError(r, t) {
        if (r.error_code === hf && t) {
          let n = r.meta?.id;
          ln(typeof n == "number", "Malformed external JS error received from the engine");
          let i = t.consumeError(n);
          return ln(i, "External error with reported id was not registered"), i;
        }
      }
      async metrics(r) {
        await this.start();
        let t = await this.engine.metrics(JSON.stringify(r));
        return r.format === "prometheus" ? t : this.parseEngineResponse(t);
      }
    };
    function xf(e) {
      return typeof e == "object" && e !== null && e.error_code !== void 0;
    }
    __name(xf, "xf");
    function Po(e, r) {
      return El({ binaryTarget: e.binaryTarget, title: r, version: e.config.clientVersion, engineVersion: e.versionInfo?.commit, database: e.config.activeProvider, query: e.lastQuery });
    }
    __name(Po, "Po");
    function Fl({ url: e, adapter: r, copyEngine: t, targetBuildType: n }) {
      let i = [], o = [], s = /* @__PURE__ */ __name((g) => {
        i.push({ _tag: "warning", value: g });
      }, "s"), a = /* @__PURE__ */ __name((g) => {
        let I = g.join(`
`);
        o.push({ _tag: "error", value: I });
      }, "a"), l = !!e?.startsWith("prisma://"), u = an(e), c = !!r, p = l || u;
      !c && t && p && n !== "client" && n !== "wasm-compiler-edge" && s(["recommend--no-engine", "In production, we recommend using `prisma generate --no-engine` (See: `prisma generate --help`)"]);
      let d = p || !t;
      c && (d || n === "edge") && (n === "edge" ? a(["Prisma Client was configured to use the `adapter` option but it was imported via its `/edge` endpoint.", "Please either remove the `/edge` endpoint or remove the `adapter` from the Prisma Client constructor."]) : p ? a(["You've provided both a driver adapter and an Accelerate database URL. Driver adapters currently cannot connect to Accelerate.", "Please provide either a driver adapter with a direct database URL or an Accelerate URL and no driver adapter."]) : t || a(["Prisma Client was configured to use the `adapter` option but `prisma generate` was run with `--no-engine`.", "Please run `prisma generate` without `--no-engine` to be able to use Prisma Client with the adapter."]));
      let f = { accelerate: d, ppg: u, driverAdapters: c };
      function h(g) {
        return g.length > 0;
      }
      __name(h, "h");
      return h(o) ? { ok: false, diagnostics: { warnings: i, errors: o }, isUsing: f } : { ok: true, diagnostics: { warnings: i }, isUsing: f };
    }
    __name(Fl, "Fl");
    function Ml({ copyEngine: e = true }, r) {
      let t;
      try {
        t = jr({ inlineDatasources: r.inlineDatasources, overrideDatasources: r.overrideDatasources, env: { ...r.env, ...process.env }, clientVersion: r.clientVersion });
      } catch {
      }
      let { ok: n, isUsing: i, diagnostics: o } = Fl({ url: t, adapter: r.adapter, copyEngine: e, targetBuildType: "library" });
      for (let p of o.warnings) at(...p.value);
      if (!n) {
        let p = o.errors[0];
        throw new Z(p.value, { clientVersion: r.clientVersion });
      }
      let s = Er(r.generator), a = s === "library", l = s === "binary", u = s === "client", c = (i.accelerate || i.ppg) && !i.driverAdapters;
      return i.accelerate ? new qt(r) : (i.driverAdapters, a ? new Qr(r) : new Qr(r));
    }
    __name(Ml, "Ml");
    function $l({ generator: e }) {
      return e?.previewFeatures ?? [];
    }
    __name($l, "$l");
    var ql = /* @__PURE__ */ __name((e) => ({ command: e }), "ql");
    var Vl = /* @__PURE__ */ __name((e) => e.strings.reduce((r, t, n) => `${r}@P${n}${t}`), "Vl");
    function Wr(e) {
      try {
        return jl(e, "fast");
      } catch {
        return jl(e, "slow");
      }
    }
    __name(Wr, "Wr");
    function jl(e, r) {
      return JSON.stringify(e.map((t) => Ul(t, r)));
    }
    __name(jl, "jl");
    function Ul(e, r) {
      if (Array.isArray(e)) return e.map((t) => Ul(t, r));
      if (typeof e == "bigint") return { prisma__type: "bigint", prisma__value: e.toString() };
      if (vr(e)) return { prisma__type: "date", prisma__value: e.toJSON() };
      if (Fe.isDecimal(e)) return { prisma__type: "decimal", prisma__value: e.toJSON() };
      if (Buffer.isBuffer(e)) return { prisma__type: "bytes", prisma__value: e.toString("base64") };
      if (vf(e)) return { prisma__type: "bytes", prisma__value: Buffer.from(e).toString("base64") };
      if (ArrayBuffer.isView(e)) {
        let { buffer: t, byteOffset: n, byteLength: i } = e;
        return { prisma__type: "bytes", prisma__value: Buffer.from(t, n, i).toString("base64") };
      }
      return typeof e == "object" && r === "slow" ? Gl(e) : e;
    }
    __name(Ul, "Ul");
    function vf(e) {
      return e instanceof ArrayBuffer || e instanceof SharedArrayBuffer ? true : typeof e == "object" && e !== null ? e[Symbol.toStringTag] === "ArrayBuffer" || e[Symbol.toStringTag] === "SharedArrayBuffer" : false;
    }
    __name(vf, "vf");
    function Gl(e) {
      if (typeof e != "object" || e === null) return e;
      if (typeof e.toJSON == "function") return e.toJSON();
      if (Array.isArray(e)) return e.map(Bl);
      let r = {};
      for (let t of Object.keys(e)) r[t] = Bl(e[t]);
      return r;
    }
    __name(Gl, "Gl");
    function Bl(e) {
      return typeof e == "bigint" ? e.toString() : Gl(e);
    }
    __name(Bl, "Bl");
    var Pf = /^(\s*alter\s)/i;
    var Ql = N("prisma:client");
    function To(e, r, t, n) {
      if (!(e !== "postgresql" && e !== "cockroachdb") && t.length > 0 && Pf.exec(r)) throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
    }
    __name(To, "To");
    var So = /* @__PURE__ */ __name(({ clientMethod: e, activeProvider: r }) => (t) => {
      let n = "", i;
      if (Vn(t)) n = t.sql, i = { values: Wr(t.values), __prismaRawParameters__: true };
      else if (Array.isArray(t)) {
        let [o, ...s] = t;
        n = o, i = { values: Wr(s || []), __prismaRawParameters__: true };
      } else switch (r) {
        case "sqlite":
        case "mysql": {
          n = t.sql, i = { values: Wr(t.values), __prismaRawParameters__: true };
          break;
        }
        case "cockroachdb":
        case "postgresql":
        case "postgres": {
          n = t.text, i = { values: Wr(t.values), __prismaRawParameters__: true };
          break;
        }
        case "sqlserver": {
          n = Vl(t), i = { values: Wr(t.values), __prismaRawParameters__: true };
          break;
        }
        default:
          throw new Error(`The ${r} provider does not support ${e}`);
      }
      return i?.values ? Ql(`prisma.${e}(${n}, ${i.values})`) : Ql(`prisma.${e}(${n})`), { query: n, parameters: i };
    }, "So");
    var Wl = { requestArgsToMiddlewareArgs(e) {
      return [e.strings, ...e.values];
    }, middlewareArgsToRequestArgs(e) {
      let [r, ...t] = e;
      return new ie(r, t);
    } };
    var Jl = { requestArgsToMiddlewareArgs(e) {
      return [e];
    }, middlewareArgsToRequestArgs(e) {
      return e[0];
    } };
    function Ro(e) {
      return function(t, n) {
        let i, o = /* @__PURE__ */ __name((s = e) => {
          try {
            return s === void 0 || s?.kind === "itx" ? i ??= Kl(t(s)) : Kl(t(s));
          } catch (a) {
            return Promise.reject(a);
          }
        }, "o");
        return { get spec() {
          return n;
        }, then(s, a) {
          return o().then(s, a);
        }, catch(s) {
          return o().catch(s);
        }, finally(s) {
          return o().finally(s);
        }, requestTransaction(s) {
          let a = o(s);
          return a.requestTransaction ? a.requestTransaction(s) : a;
        }, [Symbol.toStringTag]: "PrismaPromise" };
      };
    }
    __name(Ro, "Ro");
    function Kl(e) {
      return typeof e.then == "function" ? e : Promise.resolve(e);
    }
    __name(Kl, "Kl");
    var Tf = xi.split(".")[0];
    var Sf = { isEnabled() {
      return false;
    }, getTraceParent() {
      return "00-10-10-00";
    }, dispatchEngineSpans() {
    }, getActiveContext() {
    }, runInChildSpan(e, r) {
      return r();
    } };
    var Ao = class {
      static {
        __name(this, "Ao");
      }
      isEnabled() {
        return this.getGlobalTracingHelper().isEnabled();
      }
      getTraceParent(r) {
        return this.getGlobalTracingHelper().getTraceParent(r);
      }
      dispatchEngineSpans(r) {
        return this.getGlobalTracingHelper().dispatchEngineSpans(r);
      }
      getActiveContext() {
        return this.getGlobalTracingHelper().getActiveContext();
      }
      runInChildSpan(r, t) {
        return this.getGlobalTracingHelper().runInChildSpan(r, t);
      }
      getGlobalTracingHelper() {
        let r = globalThis[`V${Tf}_PRISMA_INSTRUMENTATION`], t = globalThis.PRISMA_INSTRUMENTATION;
        return r?.helper ?? t?.helper ?? Sf;
      }
    };
    function Hl() {
      return new Ao();
    }
    __name(Hl, "Hl");
    function Yl(e, r = () => {
    }) {
      let t, n = new Promise((i) => t = i);
      return { then(i) {
        return --e === 0 && t(r()), i?.(n);
      } };
    }
    __name(Yl, "Yl");
    function zl(e) {
      return typeof e == "string" ? e : e.reduce((r, t) => {
        let n = typeof t == "string" ? t : t.level;
        return n === "query" ? r : r && (t === "info" || r === "info") ? "info" : n;
      }, void 0);
    }
    __name(zl, "zl");
    function zn(e) {
      return typeof e.batchRequestIdx == "number";
    }
    __name(zn, "zn");
    function Zl(e) {
      if (e.action !== "findUnique" && e.action !== "findUniqueOrThrow") return;
      let r = [];
      return e.modelName && r.push(e.modelName), e.query.arguments && r.push(Co(e.query.arguments)), r.push(Co(e.query.selection)), r.join("");
    }
    __name(Zl, "Zl");
    function Co(e) {
      return `(${Object.keys(e).sort().map((t) => {
        let n = e[t];
        return typeof n == "object" && n !== null ? `(${t} ${Co(n)})` : t;
      }).join(" ")})`;
    }
    __name(Co, "Co");
    var Rf = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
    function Io(e) {
      return Rf[e];
    }
    __name(Io, "Io");
    var Zn = class {
      static {
        __name(this, "Zn");
      }
      constructor(r) {
        this.options = r;
        this.batches = {};
      }
      batches;
      tickActive = false;
      request(r) {
        let t = this.options.batchBy(r);
        return t ? (this.batches[t] || (this.batches[t] = [], this.tickActive || (this.tickActive = true, process.nextTick(() => {
          this.dispatchBatches(), this.tickActive = false;
        }))), new Promise((n, i) => {
          this.batches[t].push({ request: r, resolve: n, reject: i });
        })) : this.options.singleLoader(r);
      }
      dispatchBatches() {
        for (let r in this.batches) {
          let t = this.batches[r];
          delete this.batches[r], t.length === 1 ? this.options.singleLoader(t[0].request).then((n) => {
            n instanceof Error ? t[0].reject(n) : t[0].resolve(n);
          }).catch((n) => {
            t[0].reject(n);
          }) : (t.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(t.map((n) => n.request)).then((n) => {
            if (n instanceof Error) for (let i = 0; i < t.length; i++) t[i].reject(n);
            else for (let i = 0; i < t.length; i++) {
              let o = n[i];
              o instanceof Error ? t[i].reject(o) : t[i].resolve(o);
            }
          }).catch((n) => {
            for (let i = 0; i < t.length; i++) t[i].reject(n);
          }));
        }
      }
      get [Symbol.toStringTag]() {
        return "DataLoader";
      }
    };
    function mr(e, r) {
      if (r === null) return r;
      switch (e) {
        case "bigint":
          return BigInt(r);
        case "bytes": {
          let { buffer: t, byteOffset: n, byteLength: i } = Buffer.from(r, "base64");
          return new Uint8Array(t, n, i);
        }
        case "decimal":
          return new Fe(r);
        case "datetime":
        case "date":
          return new Date(r);
        case "time":
          return /* @__PURE__ */ new Date(`1970-01-01T${r}Z`);
        case "bigint-array":
          return r.map((t) => mr("bigint", t));
        case "bytes-array":
          return r.map((t) => mr("bytes", t));
        case "decimal-array":
          return r.map((t) => mr("decimal", t));
        case "datetime-array":
          return r.map((t) => mr("datetime", t));
        case "date-array":
          return r.map((t) => mr("date", t));
        case "time-array":
          return r.map((t) => mr("time", t));
        default:
          return r;
      }
    }
    __name(mr, "mr");
    function Xn(e) {
      let r = [], t = Af(e);
      for (let n = 0; n < e.rows.length; n++) {
        let i = e.rows[n], o = { ...t };
        for (let s = 0; s < i.length; s++) o[e.columns[s]] = mr(e.types[s], i[s]);
        r.push(o);
      }
      return r;
    }
    __name(Xn, "Xn");
    function Af(e) {
      let r = {};
      for (let t = 0; t < e.columns.length; t++) r[e.columns[t]] = null;
      return r;
    }
    __name(Af, "Af");
    var Cf = N("prisma:client:request_handler");
    var ei = class {
      static {
        __name(this, "ei");
      }
      client;
      dataloader;
      logEmitter;
      constructor(r, t) {
        this.logEmitter = t, this.client = r, this.dataloader = new Zn({ batchLoader: rl(async ({ requests: n, customDataProxyFetch: i }) => {
          let { transaction: o, otelParentCtx: s } = n[0], a = n.map((p) => p.protocolQuery), l = this.client._tracingHelper.getTraceParent(s), u = n.some((p) => Io(p.protocolQuery.action));
          return (await this.client._engine.requestBatch(a, { traceparent: l, transaction: If(o), containsWrite: u, customDataProxyFetch: i })).map((p, d) => {
            if (p instanceof Error) return p;
            try {
              return this.mapQueryEngineResult(n[d], p);
            } catch (f) {
              return f;
            }
          });
        }), singleLoader: /* @__PURE__ */ __name(async (n) => {
          let i = n.transaction?.kind === "itx" ? Xl(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: Io(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch });
          return this.mapQueryEngineResult(n, o);
        }, "singleLoader"), batchBy: /* @__PURE__ */ __name((n) => n.transaction?.id ? `transaction-${n.transaction.id}` : Zl(n.protocolQuery), "batchBy"), batchOrder(n, i) {
          return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0;
        } });
      }
      async request(r) {
        try {
          return await this.dataloader.request(r);
        } catch (t) {
          let { clientMethod: n, callsite: i, transaction: o, args: s, modelName: a } = r;
          this.handleAndLogRequestError({ error: t, clientMethod: n, callsite: i, transaction: o, args: s, modelName: a, globalOmit: r.globalOmit });
        }
      }
      mapQueryEngineResult({ dataPath: r, unpacker: t }, n) {
        let i = n?.data, o = this.unpack(i, r, t);
        return process.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o;
      }
      handleAndLogRequestError(r) {
        try {
          this.handleRequestError(r);
        } catch (t) {
          throw this.logEmitter && this.logEmitter.emit("error", { message: t.message, target: r.clientMethod, timestamp: /* @__PURE__ */ new Date() }), t;
        }
      }
      handleRequestError({ error: r, clientMethod: t, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) {
        if (Cf(r), Df(r, i)) throw r;
        if (r instanceof z && Of(r)) {
          let u = eu(r.meta);
          Nn({ args: o, errors: [u], callsite: n, errorFormat: this.client._errorFormat, originalMethod: t, clientVersion: this.client._clientVersion, globalOmit: a });
        }
        let l = r.message;
        if (n && (l = Tn({ callsite: n, originalMethod: t, isPanic: r.isPanic, showColors: this.client._errorFormat === "pretty", message: l })), l = this.sanitizeMessage(l), r.code) {
          let u = s ? { modelName: s, ...r.meta } : r.meta;
          throw new z(l, { code: r.code, clientVersion: this.client._clientVersion, meta: u, batchRequestIdx: r.batchRequestIdx });
        } else {
          if (r.isPanic) throw new ae(l, this.client._clientVersion);
          if (r instanceof V) throw new V(l, { clientVersion: this.client._clientVersion, batchRequestIdx: r.batchRequestIdx });
          if (r instanceof P) throw new P(l, this.client._clientVersion);
          if (r instanceof ae) throw new ae(l, this.client._clientVersion);
        }
        throw r.clientVersion = this.client._clientVersion, r;
      }
      sanitizeMessage(r) {
        return this.client._errorFormat && this.client._errorFormat !== "pretty" ? wr(r) : r;
      }
      unpack(r, t, n) {
        if (!r || (r.data && (r = r.data), !r)) return r;
        let i = Object.keys(r)[0], o = Object.values(r)[0], s = t.filter((u) => u !== "select" && u !== "include"), a = ao(o, s), l = i === "queryRaw" ? Xn(a) : Vr(a);
        return n ? n(l) : l;
      }
      get [Symbol.toStringTag]() {
        return "RequestHandler";
      }
    };
    function If(e) {
      if (e) {
        if (e.kind === "batch") return { kind: "batch", options: { isolationLevel: e.isolationLevel } };
        if (e.kind === "itx") return { kind: "itx", options: Xl(e) };
        ar(e, "Unknown transaction kind");
      }
    }
    __name(If, "If");
    function Xl(e) {
      return { id: e.id, payload: e.payload };
    }
    __name(Xl, "Xl");
    function Df(e, r) {
      return zn(e) && r?.kind === "batch" && e.batchRequestIdx !== r.index;
    }
    __name(Df, "Df");
    function Of(e) {
      return e.code === "P2009" || e.code === "P2012";
    }
    __name(Of, "Of");
    function eu(e) {
      if (e.kind === "Union") return { kind: "Union", errors: e.errors.map(eu) };
      if (Array.isArray(e.selectionPath)) {
        let [, ...r] = e.selectionPath;
        return { ...e, selectionPath: r };
      }
      return e;
    }
    __name(eu, "eu");
    var ru = xl;
    var su = O(Ki());
    var _ = class extends Error {
      static {
        __name(this, "_");
      }
      constructor(r) {
        super(r + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
      }
      get [Symbol.toStringTag]() {
        return "PrismaClientConstructorValidationError";
      }
    };
    x(_, "PrismaClientConstructorValidationError");
    var tu = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"];
    var nu = ["pretty", "colorless", "minimal"];
    var iu = ["info", "query", "warn", "error"];
    var kf = { datasources: /* @__PURE__ */ __name((e, { datasourceNames: r }) => {
      if (e) {
        if (typeof e != "object" || Array.isArray(e)) throw new _(`Invalid value ${JSON.stringify(e)} for "datasources" provided to PrismaClient constructor`);
        for (let [t, n] of Object.entries(e)) {
          if (!r.includes(t)) {
            let i = Jr(t, r) || ` Available datasources: ${r.join(", ")}`;
            throw new _(`Unknown datasource ${t} provided to PrismaClient constructor.${i}`);
          }
          if (typeof n != "object" || Array.isArray(n)) throw new _(`Invalid value ${JSON.stringify(e)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          if (n && typeof n == "object") for (let [i, o] of Object.entries(n)) {
            if (i !== "url") throw new _(`Invalid value ${JSON.stringify(e)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
            if (typeof o != "string") throw new _(`Invalid value ${JSON.stringify(o)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
          }
        }
      }
    }, "datasources"), adapter: /* @__PURE__ */ __name((e, r) => {
      if (!e && Er(r.generator) === "client") throw new _('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.');
      if (e !== null) {
        if (e === void 0) throw new _('"adapter" property must not be undefined, use null to conditionally disable driver adapters.');
        if (Er(r.generator) === "binary") throw new _('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.');
      }
    }, "adapter"), datasourceUrl: /* @__PURE__ */ __name((e) => {
      if (typeof e < "u" && typeof e != "string") throw new _(`Invalid value ${JSON.stringify(e)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
    }, "datasourceUrl"), errorFormat: /* @__PURE__ */ __name((e) => {
      if (e) {
        if (typeof e != "string") throw new _(`Invalid value ${JSON.stringify(e)} for "errorFormat" provided to PrismaClient constructor.`);
        if (!nu.includes(e)) {
          let r = Jr(e, nu);
          throw new _(`Invalid errorFormat ${e} provided to PrismaClient constructor.${r}`);
        }
      }
    }, "errorFormat"), log: /* @__PURE__ */ __name((e) => {
      if (!e) return;
      if (!Array.isArray(e)) throw new _(`Invalid value ${JSON.stringify(e)} for "log" provided to PrismaClient constructor.`);
      function r(t) {
        if (typeof t == "string" && !iu.includes(t)) {
          let n = Jr(t, iu);
          throw new _(`Invalid log level "${t}" provided to PrismaClient constructor.${n}`);
        }
      }
      __name(r, "r");
      for (let t of e) {
        r(t);
        let n = { level: r, emit: /* @__PURE__ */ __name((i) => {
          let o = ["stdout", "event"];
          if (!o.includes(i)) {
            let s = Jr(i, o);
            throw new _(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
          }
        }, "emit") };
        if (t && typeof t == "object") for (let [i, o] of Object.entries(t)) if (n[i]) n[i](o);
        else throw new _(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
      }
    }, "log"), transactionOptions: /* @__PURE__ */ __name((e) => {
      if (!e) return;
      let r = e.maxWait;
      if (r != null && r <= 0) throw new _(`Invalid value ${r} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
      let t = e.timeout;
      if (t != null && t <= 0) throw new _(`Invalid value ${t} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
    }, "transactionOptions"), omit: /* @__PURE__ */ __name((e, r) => {
      if (typeof e != "object") throw new _('"omit" option is expected to be an object.');
      if (e === null) throw new _('"omit" option can not be `null`');
      let t = [];
      for (let [n, i] of Object.entries(e)) {
        let o = Nf(n, r.runtimeDataModel);
        if (!o) {
          t.push({ kind: "UnknownModel", modelKey: n });
          continue;
        }
        for (let [s, a] of Object.entries(i)) {
          let l = o.fields.find((u) => u.name === s);
          if (!l) {
            t.push({ kind: "UnknownField", modelKey: n, fieldName: s });
            continue;
          }
          if (l.relationName) {
            t.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
            continue;
          }
          typeof a != "boolean" && t.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
        }
      }
      if (t.length > 0) throw new _(Lf(e, t));
    }, "omit"), __internal: /* @__PURE__ */ __name((e) => {
      if (!e) return;
      let r = ["debug", "engine", "configOverride"];
      if (typeof e != "object") throw new _(`Invalid value ${JSON.stringify(e)} for "__internal" to PrismaClient constructor`);
      for (let [t] of Object.entries(e)) if (!r.includes(t)) {
        let n = Jr(t, r);
        throw new _(`Invalid property ${JSON.stringify(t)} for "__internal" provided to PrismaClient constructor.${n}`);
      }
    }, "__internal") };
    function au(e, r) {
      for (let [t, n] of Object.entries(e)) {
        if (!tu.includes(t)) {
          let i = Jr(t, tu);
          throw new _(`Unknown property ${t} provided to PrismaClient constructor.${i}`);
        }
        kf[t](n, r);
      }
      if (e.datasourceUrl && e.datasources) throw new _('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them');
    }
    __name(au, "au");
    function Jr(e, r) {
      if (r.length === 0 || typeof e != "string") return "";
      let t = _f(e, r);
      return t ? ` Did you mean "${t}"?` : "";
    }
    __name(Jr, "Jr");
    function _f(e, r) {
      if (r.length === 0) return null;
      let t = r.map((i) => ({ value: i, distance: (0, su.default)(e, i) }));
      t.sort((i, o) => i.distance < o.distance ? -1 : 1);
      let n = t[0];
      return n.distance < 3 ? n.value : null;
    }
    __name(_f, "_f");
    function Nf(e, r) {
      return ou(r.models, e) ?? ou(r.types, e);
    }
    __name(Nf, "Nf");
    function ou(e, r) {
      let t = Object.keys(e).find((n) => We(n) === r);
      if (t) return e[t];
    }
    __name(ou, "ou");
    function Lf(e, r) {
      let t = _r(e);
      for (let o of r) switch (o.kind) {
        case "UnknownModel":
          t.arguments.getField(o.modelKey)?.markAsError(), t.addErrorMessage(() => `Unknown model name: ${o.modelKey}.`);
          break;
        case "UnknownField":
          t.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), t.addErrorMessage(() => `Model "${o.modelKey}" does not have a field named "${o.fieldName}".`);
          break;
        case "RelationInOmit":
          t.arguments.getDeepField([o.modelKey, o.fieldName])?.markAsError(), t.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
          break;
        case "InvalidFieldValue":
          t.arguments.getDeepFieldValue([o.modelKey, o.fieldName])?.markAsError(), t.addErrorMessage(() => "Omit field option value must be a boolean.");
          break;
      }
      let { message: n, args: i } = _n(t, "colorless");
      return `Error validating "omit" option:

${i}

${n}`;
    }
    __name(Lf, "Lf");
    function lu(e) {
      return e.length === 0 ? Promise.resolve([]) : new Promise((r, t) => {
        let n = new Array(e.length), i = null, o = false, s = 0, a = /* @__PURE__ */ __name(() => {
          o || (s++, s === e.length && (o = true, i ? t(i) : r(n)));
        }, "a"), l = /* @__PURE__ */ __name((u) => {
          o || (o = true, t(u));
        }, "l");
        for (let u = 0; u < e.length; u++) e[u].then((c) => {
          n[u] = c, a();
        }, (c) => {
          if (!zn(c)) {
            l(c);
            return;
          }
          c.batchRequestIdx === u ? l(c) : (i || (i = c), a());
        });
      });
    }
    __name(lu, "lu");
    var rr = N("prisma:client");
    typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
    var Ff = { requestArgsToMiddlewareArgs: /* @__PURE__ */ __name((e) => e, "requestArgsToMiddlewareArgs"), middlewareArgsToRequestArgs: /* @__PURE__ */ __name((e) => e, "middlewareArgsToRequestArgs") };
    var Mf = Symbol.for("prisma.client.transaction.id");
    var $f = { id: 0, nextId() {
      return ++this.id;
    } };
    function fu(e) {
      class r {
        static {
          __name(this, "r");
        }
        _originalClient = this;
        _runtimeDataModel;
        _requestHandler;
        _connectionPromise;
        _disconnectionPromise;
        _engineConfig;
        _accelerateEngineConfig;
        _clientVersion;
        _errorFormat;
        _tracingHelper;
        _previewFeatures;
        _activeProvider;
        _globalOmit;
        _extensions;
        _engine;
        _appliedParent;
        _createPrismaPromise = Ro();
        constructor(n) {
          e = n?.__internal?.configOverride?.(e) ?? e, sl(e), n && au(n, e);
          let i = new du.EventEmitter().on("error", () => {
          });
          this._extensions = Nr.empty(), this._previewFeatures = $l(e), this._clientVersion = e.clientVersion ?? ru, this._activeProvider = e.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Hl();
          let o = e.relativeEnvPaths && { rootEnvPath: e.relativeEnvPaths.rootEnvPath && ri.default.resolve(e.dirname, e.relativeEnvPaths.rootEnvPath), schemaEnvPath: e.relativeEnvPaths.schemaEnvPath && ri.default.resolve(e.dirname, e.relativeEnvPaths.schemaEnvPath) }, s;
          if (n?.adapter) {
            s = n.adapter;
            let l = e.activeProvider === "postgresql" || e.activeProvider === "cockroachdb" ? "postgres" : e.activeProvider;
            if (s.provider !== l) throw new P(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${l}\` specified in the Prisma schema.`, this._clientVersion);
            if (n.datasources || n.datasourceUrl !== void 0) throw new P("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
          }
          let a = !s && o && st(o, { conflictCheck: "none" }) || e.injectableEdgeEnv?.();
          try {
            let l = n ?? {}, u = l.__internal ?? {}, c = u.debug === true;
            c && N.enable("prisma:client");
            let p = ri.default.resolve(e.dirname, e.relativePath);
            mu.default.existsSync(p) || (p = e.dirname), rr("dirname", e.dirname), rr("relativePath", e.relativePath), rr("cwd", p);
            let d = u.engine || {};
            if (l.errorFormat ? this._errorFormat = l.errorFormat : process.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : process.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e.runtimeDataModel, this._engineConfig = { cwd: p, dirname: e.dirname, enableDebugLogs: c, allowTriggerPanic: d.allowTriggerPanic, prismaPath: d.binaryPath ?? void 0, engineEndpoint: d.endpoint, generator: e.generator, showColors: this._errorFormat === "pretty", logLevel: l.log && zl(l.log), logQueries: l.log && !!(typeof l.log == "string" ? l.log === "query" : l.log.find((f) => typeof f == "string" ? f === "query" : f.level === "query")), env: a?.parsed ?? {}, flags: [], engineWasm: e.engineWasm, compilerWasm: e.compilerWasm, clientVersion: e.clientVersion, engineVersion: e.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e.activeProvider, inlineSchema: e.inlineSchema, overrideDatasources: al(l, e.datasourceNames), inlineDatasources: e.inlineDatasources, inlineSchemaHash: e.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l.transactionOptions?.maxWait ?? 2e3, timeout: l.transactionOptions?.timeout ?? 5e3, isolationLevel: l.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: e.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: jr, getBatchRequestPayload: Mr, prismaGraphQLToJSError: $r, PrismaClientUnknownRequestError: V, PrismaClientInitializationError: P, PrismaClientKnownRequestError: z, debug: N("prisma:client:accelerateEngine"), engineVersion: cu.version, clientVersion: e.clientVersion } }, rr("clientVersion", e.clientVersion), this._engine = Ml(e, this._engineConfig), this._requestHandler = new ei(this, i), l.log) for (let f of l.log) {
              let h = typeof f == "string" ? f : f.emit === "stdout" ? f.level : null;
              h && this.$on(h, (g) => {
                nt.log(`${nt.tags[h] ?? ""}`, g.message || g.query);
              });
            }
          } catch (l) {
            throw l.clientVersion = this._clientVersion, l;
          }
          return this._appliedParent = Pt(this);
        }
        get [Symbol.toStringTag]() {
          return "PrismaClient";
        }
        $on(n, i) {
          return n === "beforeExit" ? this._engine.onBeforeExit(i) : n && this._engineConfig.logEmitter.on(n, i), this;
        }
        $connect() {
          try {
            return this._engine.start();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          }
        }
        async $disconnect() {
          try {
            await this._engine.stop();
          } catch (n) {
            throw n.clientVersion = this._clientVersion, n;
          } finally {
            Uo();
          }
        }
        $executeRawInternal(n, i, o, s) {
          let a = this._activeProvider;
          return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: So({ clientMethod: i, activeProvider: a }), callsite: Ze(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $executeRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) {
              let [s, a] = uu(n, i);
              return To(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
            }
            throw new Z("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
          });
        }
        $executeRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => (To(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i])));
        }
        $runCommandRaw(n) {
          if (e.activeProvider !== "mongodb") throw new Z(`The ${e.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
          return this._createPrismaPromise((i) => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: ql, callsite: Ze(this._errorFormat), transaction: i }));
        }
        async $queryRawInternal(n, i, o, s) {
          let a = this._activeProvider;
          return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: So({ clientMethod: i, activeProvider: a }), callsite: Ze(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
        }
        $queryRaw(n, ...i) {
          return this._createPrismaPromise((o) => {
            if (n.raw !== void 0 || n.sql !== void 0) return this.$queryRawInternal(o, "$queryRaw", ...uu(n, i));
            throw new Z("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
          });
        }
        $queryRawTyped(n) {
          return this._createPrismaPromise((i) => {
            if (!this._hasPreviewFlag("typedSql")) throw new Z("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
            return this.$queryRawInternal(i, "$queryRawTyped", n);
          });
        }
        $queryRawUnsafe(n, ...i) {
          return this._createPrismaPromise((o) => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i]));
        }
        _transactionWithArray({ promises: n, options: i }) {
          let o = $f.nextId(), s = Yl(n.length), a = n.map((l, u) => {
            if (l?.[Symbol.toStringTag] !== "PrismaPromise") throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
            let c = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, p = { kind: "batch", id: o, index: u, isolationLevel: c, lock: s };
            return l.requestTransaction?.(p) ?? l;
          });
          return lu(a);
        }
        async _transactionWithCallback({ callback: n, options: i }) {
          let o = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a = await this._engine.transaction("start", o, s), l;
          try {
            let u = { kind: "itx", ...a };
            l = await n(this._createItxClient(u)), await this._engine.transaction("commit", o, a);
          } catch (u) {
            throw await this._engine.transaction("rollback", o, a).catch(() => {
            }), u;
          }
          return l;
        }
        _createItxClient(n) {
          return he(Pt(he(Qa(this), [re("_appliedParent", () => this._appliedParent._createItxClient(n)), re("_createPrismaPromise", () => Ro(n)), re(Mf, () => n.id)])), [Fr(Ya)]);
        }
        $transaction(n, i) {
          let o;
          typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o = /* @__PURE__ */ __name(() => {
            throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.");
          }, "o") : o = /* @__PURE__ */ __name(() => this._transactionWithCallback({ callback: n, options: i }), "o") : o = /* @__PURE__ */ __name(() => this._transactionWithArray({ promises: n, options: i }), "o");
          let s = { name: "transaction", attributes: { method: "$transaction" } };
          return this._tracingHelper.runInChildSpan(s, o);
        }
        _request(n) {
          n.otelParentCtx = this._tracingHelper.getActiveContext();
          let i = n.middlewareArgsMapper ?? Ff, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = /* @__PURE__ */ __name(async (l) => {
            let { runInTransaction: u, args: c, ...p } = l, d = { ...n, ...p };
            c && (d.args = i.middlewareArgsToRequestArgs(c)), n.transaction !== void 0 && u === false && delete d.transaction;
            let f = await el(this, d);
            return d.model ? Ha({ result: f, modelName: d.model, args: d.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : f;
          }, "a");
          return this._tracingHelper.runInChildSpan(s.operation, () => new pu.AsyncResource("prisma-client-request").runInAsyncScope(() => a(o)));
        }
        async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: l, argsMapper: u, transaction: c, unpacker: p, otelParentCtx: d, customDataProxyFetch: f }) {
          try {
            n = u ? u(n) : n;
            let h = { name: "serialize" }, g = this._tracingHelper.runInChildSpan(h, () => $n({ modelName: l, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
            return N.enabled("prisma:client") && (rr("Prisma Client call:"), rr(`prisma.${i}(${Na(n)})`), rr("Generated request:"), rr(JSON.stringify(g, null, 2) + `
`)), c?.kind === "batch" && await c.lock, this._requestHandler.request({ protocolQuery: g, modelName: l, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: c, unpacker: p, otelParentCtx: d, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: f });
          } catch (h) {
            throw h.clientVersion = this._clientVersion, h;
          }
        }
        $metrics = new Lr(this);
        _hasPreviewFlag(n) {
          return !!this._engineConfig.previewFeatures?.includes(n);
        }
        $applyPendingMigrations() {
          return this._engine.applyPendingMigrations();
        }
        $extends = Wa;
      }
      return r;
    }
    __name(fu, "fu");
    function uu(e, r) {
      return qf(e) ? [new ie(e, r), Wl] : [e, Jl];
    }
    __name(uu, "uu");
    function qf(e) {
      return Array.isArray(e) && Array.isArray(e.raw);
    }
    __name(qf, "qf");
    var Vf = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
    function gu(e) {
      return new Proxy(e, { get(r, t) {
        if (t in r) return r[t];
        if (!Vf.has(t)) throw new TypeError(`Invalid enum value: ${String(t)}`);
      } });
    }
    __name(gu, "gu");
    function hu(e) {
      st(e, { conflictCheck: "warn" });
    }
    __name(hu, "hu");
  }
});

// node_modules/.prisma/client/index.js
var require_client3 = __commonJS({
  "node_modules/.prisma/client/index.js"(exports) {
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    var {
      PrismaClientKnownRequestError: PrismaClientKnownRequestError2,
      PrismaClientUnknownRequestError: PrismaClientUnknownRequestError2,
      PrismaClientRustPanicError: PrismaClientRustPanicError2,
      PrismaClientInitializationError: PrismaClientInitializationError2,
      PrismaClientValidationError: PrismaClientValidationError2,
      getPrismaClient: getPrismaClient2,
      sqltag: sqltag2,
      empty: empty2,
      join: join2,
      raw: raw2,
      skip: skip2,
      Decimal: Decimal2,
      Debug: Debug3,
      objectEnumValues: objectEnumValues2,
      makeStrictEnum: makeStrictEnum2,
      Extensions: Extensions2,
      warnOnce: warnOnce2,
      defineDmmfProperty: defineDmmfProperty2,
      Public: Public2,
      getRuntime: getRuntime2,
      createParam: createParam2
    } = require_library();
    var Prisma = {};
    exports.Prisma = Prisma;
    exports.$Enums = {};
    Prisma.prismaVersion = {
      client: "6.19.3",
      engine: "c2990dca591cba766e3b7ef5d9e8a84796e47ab7"
    };
    Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError2;
    Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError2;
    Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError2;
    Prisma.PrismaClientInitializationError = PrismaClientInitializationError2;
    Prisma.PrismaClientValidationError = PrismaClientValidationError2;
    Prisma.Decimal = Decimal2;
    Prisma.sql = sqltag2;
    Prisma.empty = empty2;
    Prisma.join = join2;
    Prisma.raw = raw2;
    Prisma.validator = Public2.validator;
    Prisma.getExtensionContext = Extensions2.getExtensionContext;
    Prisma.defineExtension = Extensions2.defineExtension;
    Prisma.DbNull = objectEnumValues2.instances.DbNull;
    Prisma.JsonNull = objectEnumValues2.instances.JsonNull;
    Prisma.AnyNull = objectEnumValues2.instances.AnyNull;
    Prisma.NullTypes = {
      DbNull: objectEnumValues2.classes.DbNull,
      JsonNull: objectEnumValues2.classes.JsonNull,
      AnyNull: objectEnumValues2.classes.AnyNull
    };
    var path = __require("path");
    exports.Prisma.TransactionIsolationLevel = makeStrictEnum2({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    exports.Prisma.ProjectScalarFieldEnum = {
      id: "id",
      ownerId: "ownerId",
      name: "name",
      description: "description",
      status: "status",
      canvasJsonPath: "canvasJsonPath",
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    };
    exports.Prisma.ProjectCollaboratorScalarFieldEnum = {
      id: "id",
      projectId: "projectId",
      email: "email",
      createdAt: "createdAt"
    };
    exports.Prisma.TaskRunScalarFieldEnum = {
      id: "id",
      runId: "runId",
      projectId: "projectId",
      userId: "userId",
      createdAt: "createdAt"
    };
    exports.Prisma.ProjectSpecScalarFieldEnum = {
      id: "id",
      projectId: "projectId",
      filePath: "filePath",
      createdAt: "createdAt"
    };
    exports.Prisma.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports.Prisma.QueryMode = {
      default: "default",
      insensitive: "insensitive"
    };
    exports.Prisma.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports.ProjectStatus = exports.$Enums.ProjectStatus = {
      DRAFT: "DRAFT",
      ARCHIVED: "ARCHIVED"
    };
    exports.Prisma.ModelName = {
      Project: "Project",
      ProjectCollaborator: "ProjectCollaborator",
      TaskRun: "TaskRun",
      ProjectSpec: "ProjectSpec"
    };
    var config = {
      "generator": {
        "name": "client",
        "provider": {
          "fromEnvVar": null,
          "value": "prisma-client-js"
        },
        "output": {
          "value": "C:\\Users\\ANUSHKA SINGH\\Desktop\\summer_project\\ghost-ai\\node_modules\\@prisma\\client",
          "fromEnvVar": null
        },
        "config": {
          "engineType": "library"
        },
        "binaryTargets": [
          {
            "fromEnvVar": null,
            "value": "windows",
            "native": true
          }
        ],
        "previewFeatures": [],
        "sourceFilePath": "C:\\Users\\ANUSHKA SINGH\\Desktop\\summer_project\\ghost-ai\\prisma\\schema.prisma"
      },
      "relativeEnvPaths": {
        "rootEnvPath": null,
        "schemaEnvPath": "../../../.env"
      },
      "relativePath": "../../../prisma",
      "clientVersion": "6.19.3",
      "engineVersion": "c2990dca591cba766e3b7ef5d9e8a84796e47ab7",
      "datasourceNames": [
        "db"
      ],
      "activeProvider": "postgresql",
      "postinstall": false,
      "inlineDatasources": {
        "db": {
          "url": {
            "fromEnvVar": "DATABASE_URL",
            "value": null
          }
        }
      },
      "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nenum ProjectStatus {\n  DRAFT\n  ARCHIVED\n}\n\nmodel Project {\n  id             String                @id @default(cuid())\n  ownerId        String                @db.Text\n  name           String                @db.Text\n  description    String?               @db.Text\n  status         ProjectStatus         @default(DRAFT)\n  canvasJsonPath String?               @db.Text\n  createdAt      DateTime              @default(now())\n  updatedAt      DateTime              @updatedAt\n  collaborators  ProjectCollaborator[]\n  specs          ProjectSpec[]\n\n  @@index([ownerId])\n  @@index([createdAt])\n}\n\nmodel ProjectCollaborator {\n  id        String   @id @default(cuid())\n  projectId String\n  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  email     String   @db.Text\n  createdAt DateTime @default(now())\n\n  @@unique([projectId, email])\n  @@index([email])\n  @@index([projectId, createdAt])\n}\n\nmodel TaskRun {\n  id        String   @id @default(cuid())\n  runId     String   @unique @db.Text\n  projectId String\n  userId    String   @db.Text\n  createdAt DateTime @default(now())\n\n  @@index([runId])\n  @@index([userId, projectId])\n}\n\nmodel ProjectSpec {\n  id        String   @id @default(cuid())\n  projectId String\n  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  filePath  String   @db.Text\n  createdAt DateTime @default(now())\n\n  @@index([projectId])\n}\n',
      "inlineSchemaHash": "6dec1118b6f9f5d3a8bc9a7d52d3959b4564365d89cb12424ece546443caf2c9",
      "copyEngine": true
    };
    var fs = __require("fs");
    config.dirname = __dirname;
    if (!fs.existsSync(path.join(__dirname, "schema.prisma"))) {
      const alternativePaths = [
        "node_modules/.prisma/client",
        ".prisma/client"
      ];
      const alternativePath = alternativePaths.find((altPath) => {
        return fs.existsSync(path.join(process.cwd(), altPath, "schema.prisma"));
      }) ?? alternativePaths[0];
      config.dirname = path.join(process.cwd(), alternativePath);
      config.isBundled = true;
    }
    config.runtimeDataModel = JSON.parse('{"models":{"Project":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"ownerId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ProjectStatus","nativeType":null,"default":"DRAFT","isGenerated":false,"isUpdatedAt":false},{"name":"canvasJsonPath","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"collaborators","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ProjectCollaborator","nativeType":null,"relationName":"ProjectToProjectCollaborator","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"specs","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ProjectSpec","nativeType":null,"relationName":"ProjectToProjectSpec","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ProjectCollaborator":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"project","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","nativeType":null,"relationName":"ProjectToProjectCollaborator","relationFromFields":["projectId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["projectId","email"]],"uniqueIndexes":[{"name":null,"fields":["projectId","email"]}],"isGenerated":false},"TaskRun":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"runId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ProjectSpec":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"project","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","nativeType":null,"relationName":"ProjectToProjectSpec","relationFromFields":["projectId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"filePath","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{"ProjectStatus":{"values":[{"name":"DRAFT","dbName":null},{"name":"ARCHIVED","dbName":null}],"dbName":null}},"types":{}}');
    defineDmmfProperty2(exports.Prisma, config.runtimeDataModel);
    config.engineWasm = void 0;
    config.compilerWasm = void 0;
    var { warnEnvConflicts: warnEnvConflicts2 } = require_library();
    warnEnvConflicts2({
      rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
      schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
    });
    var PrismaClient2 = getPrismaClient2(config);
    exports.PrismaClient = PrismaClient2;
    Object.assign(exports, Prisma);
    path.join(__dirname, "query_engine-windows.dll.node");
    path.join(process.cwd(), "node_modules/.prisma/client/query_engine-windows.dll.node");
    path.join(__dirname, "schema.prisma");
    path.join(process.cwd(), "node_modules/.prisma/client/schema.prisma");
  }
});

// node_modules/.prisma/client/default.js
var require_default = __commonJS({
  "node_modules/.prisma/client/default.js"(exports, module) {
    init_esm();
    module.exports = { ...require_client3() };
  }
});

// node_modules/@prisma/client/default.js
var require_default2 = __commonJS({
  "node_modules/@prisma/client/default.js"(exports, module) {
    init_esm();
    module.exports = {
      ...require_default()
    };
  }
});

// lib/prisma.ts
init_esm();

// node_modules/pg/esm/index.mjs
init_esm();
var import_lib = __toESM(require_lib2(), 1);
var Client = import_lib.default.Client;
var Pool = import_lib.default.Pool;
var Connection = import_lib.default.Connection;
var types = import_lib.default.types;
var Query = import_lib.default.Query;
var DatabaseError = import_lib.default.DatabaseError;
var escapeIdentifier = import_lib.default.escapeIdentifier;
var escapeLiteral = import_lib.default.escapeLiteral;
var Result = import_lib.default.Result;
var TypeOverrides = import_lib.default.TypeOverrides;
var defaults = import_lib.default.defaults;
var esm_default = import_lib.default;

// node_modules/@prisma/adapter-pg/dist/index.mjs
init_esm();

// node_modules/@prisma/driver-adapter-utils/dist/index.mjs
init_esm();

// node_modules/@prisma/driver-adapter-utils/node_modules/@prisma/debug/dist/index.mjs
init_esm();
var __defProp = Object.defineProperty;
var __export = /* @__PURE__ */ __name((target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
}, "__export");
var colors_exports = {};
__export(colors_exports, {
  $: /* @__PURE__ */ __name(() => $, "$"),
  bgBlack: /* @__PURE__ */ __name(() => bgBlack, "bgBlack"),
  bgBlue: /* @__PURE__ */ __name(() => bgBlue, "bgBlue"),
  bgCyan: /* @__PURE__ */ __name(() => bgCyan, "bgCyan"),
  bgGreen: /* @__PURE__ */ __name(() => bgGreen, "bgGreen"),
  bgMagenta: /* @__PURE__ */ __name(() => bgMagenta, "bgMagenta"),
  bgRed: /* @__PURE__ */ __name(() => bgRed, "bgRed"),
  bgWhite: /* @__PURE__ */ __name(() => bgWhite, "bgWhite"),
  bgYellow: /* @__PURE__ */ __name(() => bgYellow, "bgYellow"),
  black: /* @__PURE__ */ __name(() => black, "black"),
  blue: /* @__PURE__ */ __name(() => blue, "blue"),
  bold: /* @__PURE__ */ __name(() => bold, "bold"),
  cyan: /* @__PURE__ */ __name(() => cyan, "cyan"),
  dim: /* @__PURE__ */ __name(() => dim, "dim"),
  gray: /* @__PURE__ */ __name(() => gray, "gray"),
  green: /* @__PURE__ */ __name(() => green, "green"),
  grey: /* @__PURE__ */ __name(() => grey, "grey"),
  hidden: /* @__PURE__ */ __name(() => hidden, "hidden"),
  inverse: /* @__PURE__ */ __name(() => inverse, "inverse"),
  italic: /* @__PURE__ */ __name(() => italic, "italic"),
  magenta: /* @__PURE__ */ __name(() => magenta, "magenta"),
  red: /* @__PURE__ */ __name(() => red, "red"),
  reset: /* @__PURE__ */ __name(() => reset, "reset"),
  strikethrough: /* @__PURE__ */ __name(() => strikethrough, "strikethrough"),
  underline: /* @__PURE__ */ __name(() => underline, "underline"),
  white: /* @__PURE__ */ __name(() => white, "white"),
  yellow: /* @__PURE__ */ __name(() => yellow, "yellow")
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x, y) {
  let rgx = new RegExp(`\\x1b\\[${y}m`, "g");
  let open = `\x1B[${x}m`, close = `\x1B[${y}m`;
  return function(txt) {
    if (!$.enabled || txt == null) return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
__name(init, "init");
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
var MAX_ARGS_HISTORY = 100;
var COLORS = ["green", "yellow", "blue", "magenta", "cyan", "red"];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
  enable(namespace) {
    if (typeof namespace === "string") {
      globalThis.DEBUG = namespace;
    }
  },
  disable() {
    const prev = globalThis.DEBUG;
    globalThis.DEBUG = "";
    return prev;
  },
  // this is the core logic to check if logging should happen or not
  enabled(namespace) {
    const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
      return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    });
    const isListened = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
      return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
    });
    const isExcluded = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
      return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
    });
    return isListened && !isExcluded;
  },
  log: /* @__PURE__ */ __name((...args) => {
    const [namespace, format, ...rest] = args;
    const logWithFormatting = console.warn ?? console.log;
    logWithFormatting(`${namespace} ${format}`, ...rest);
  }, "log"),
  formatters: {}
  // not implemented
};
function debugCreate(namespace) {
  const instanceProps = {
    color: COLORS[lastColor++ % COLORS.length],
    enabled: topProps.enabled(namespace),
    namespace,
    log: topProps.log,
    extend: /* @__PURE__ */ __name(() => {
    }, "extend")
    // not implemented
  };
  const debugCall = /* @__PURE__ */ __name((...args) => {
    const { enabled, namespace: namespace2, color, log } = instanceProps;
    if (args.length !== 0) {
      argsHistory.push([namespace2, ...args]);
    }
    if (argsHistory.length > MAX_ARGS_HISTORY) {
      argsHistory.shift();
    }
    if (topProps.enabled(namespace2) || enabled) {
      const stringArgs = args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        return safeStringify(arg);
      });
      const ms = `+${Date.now() - lastTimestamp}ms`;
      lastTimestamp = Date.now();
      if (globalThis.DEBUG_COLORS) {
        log(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms));
      } else {
        log(namespace2, ...stringArgs, ms);
      }
    }
  }, "debugCall");
  return new Proxy(debugCall, {
    get: /* @__PURE__ */ __name((_, prop) => instanceProps[prop], "get"),
    set: /* @__PURE__ */ __name((_, prop, value) => instanceProps[prop] = value, "set")
  });
}
__name(debugCreate, "debugCreate");
var Debug2 = new Proxy(debugCreate, {
  get: /* @__PURE__ */ __name((_, prop) => topProps[prop], "get"),
  set: /* @__PURE__ */ __name((_, prop, value) => topProps[prop] = value, "set")
});
function safeStringify(value, indent = 2) {
  const cache = /* @__PURE__ */ new Set();
  return JSON.stringify(
    value,
    (key, value2) => {
      if (typeof value2 === "object" && value2 !== null) {
        if (cache.has(value2)) {
          return `[Circular *]`;
        }
        cache.add(value2);
      } else if (typeof value2 === "bigint") {
        return value2.toString();
      }
      return value2;
    },
    indent
  );
}
__name(safeStringify, "safeStringify");

// node_modules/@prisma/driver-adapter-utils/dist/index.mjs
var DriverAdapterError = class extends Error {
  static {
    __name(this, "DriverAdapterError");
  }
  name = "DriverAdapterError";
  cause;
  constructor(payload) {
    super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
    this.cause = payload;
  }
};
var debug = Debug2("driver-adapter-utils");
var ColumnTypeEnum = {
  // Scalars
  Int32: 0,
  Int64: 1,
  Float: 2,
  Double: 3,
  Numeric: 4,
  Boolean: 5,
  Character: 6,
  Text: 7,
  Date: 8,
  Time: 9,
  DateTime: 10,
  Json: 11,
  Enum: 12,
  Bytes: 13,
  Set: 14,
  Uuid: 15,
  // Arrays
  Int32Array: 64,
  Int64Array: 65,
  FloatArray: 66,
  DoubleArray: 67,
  NumericArray: 68,
  BooleanArray: 69,
  CharacterArray: 70,
  TextArray: 71,
  DateArray: 72,
  TimeArray: 73,
  DateTimeArray: 74,
  JsonArray: 75,
  EnumArray: 76,
  BytesArray: 77,
  UuidArray: 78,
  // Custom
  UnknownNumber: 128
};
var mockAdapterErrors = {
  queryRaw: new Error("Not implemented: queryRaw"),
  executeRaw: new Error("Not implemented: executeRaw"),
  startTransaction: new Error("Not implemented: startTransaction"),
  executeScript: new Error("Not implemented: executeScript"),
  dispose: new Error("Not implemented: dispose")
};

// node_modules/@prisma/adapter-pg/dist/index.mjs
var import_postgres_array = __toESM(require_postgres_array2(), 1);
var name = "@prisma/adapter-pg";
var FIRST_NORMAL_OBJECT_ID = 16384;
var { types: types2 } = esm_default;
var { builtins: ScalarColumnType, getTypeParser } = types2;
var AdditionalScalarColumnType = {
  NAME: 19
};
var ArrayColumnType = {
  BIT_ARRAY: 1561,
  BOOL_ARRAY: 1e3,
  BYTEA_ARRAY: 1001,
  BPCHAR_ARRAY: 1014,
  CHAR_ARRAY: 1002,
  CIDR_ARRAY: 651,
  DATE_ARRAY: 1182,
  FLOAT4_ARRAY: 1021,
  FLOAT8_ARRAY: 1022,
  INET_ARRAY: 1041,
  INT2_ARRAY: 1005,
  INT4_ARRAY: 1007,
  INT8_ARRAY: 1016,
  JSONB_ARRAY: 3807,
  JSON_ARRAY: 199,
  MONEY_ARRAY: 791,
  NUMERIC_ARRAY: 1231,
  OID_ARRAY: 1028,
  TEXT_ARRAY: 1009,
  TIMESTAMP_ARRAY: 1115,
  TIMESTAMPTZ_ARRAY: 1185,
  TIME_ARRAY: 1183,
  UUID_ARRAY: 2951,
  VARBIT_ARRAY: 1563,
  VARCHAR_ARRAY: 1015,
  XML_ARRAY: 143
};
var UnsupportedNativeDataType = class _UnsupportedNativeDataType extends Error {
  static {
    __name(this, "_UnsupportedNativeDataType");
  }
  // map of type codes to type names
  static typeNames = {
    16: "bool",
    17: "bytea",
    18: "char",
    19: "name",
    20: "int8",
    21: "int2",
    22: "int2vector",
    23: "int4",
    24: "regproc",
    25: "text",
    26: "oid",
    27: "tid",
    28: "xid",
    29: "cid",
    30: "oidvector",
    32: "pg_ddl_command",
    71: "pg_type",
    75: "pg_attribute",
    81: "pg_proc",
    83: "pg_class",
    114: "json",
    142: "xml",
    194: "pg_node_tree",
    269: "table_am_handler",
    325: "index_am_handler",
    600: "point",
    601: "lseg",
    602: "path",
    603: "box",
    604: "polygon",
    628: "line",
    650: "cidr",
    700: "float4",
    701: "float8",
    705: "unknown",
    718: "circle",
    774: "macaddr8",
    790: "money",
    829: "macaddr",
    869: "inet",
    1033: "aclitem",
    1042: "bpchar",
    1043: "varchar",
    1082: "date",
    1083: "time",
    1114: "timestamp",
    1184: "timestamptz",
    1186: "interval",
    1266: "timetz",
    1560: "bit",
    1562: "varbit",
    1700: "numeric",
    1790: "refcursor",
    2202: "regprocedure",
    2203: "regoper",
    2204: "regoperator",
    2205: "regclass",
    2206: "regtype",
    2249: "record",
    2275: "cstring",
    2276: "any",
    2277: "anyarray",
    2278: "void",
    2279: "trigger",
    2280: "language_handler",
    2281: "internal",
    2283: "anyelement",
    2287: "_record",
    2776: "anynonarray",
    2950: "uuid",
    2970: "txid_snapshot",
    3115: "fdw_handler",
    3220: "pg_lsn",
    3310: "tsm_handler",
    3361: "pg_ndistinct",
    3402: "pg_dependencies",
    3500: "anyenum",
    3614: "tsvector",
    3615: "tsquery",
    3642: "gtsvector",
    3734: "regconfig",
    3769: "regdictionary",
    3802: "jsonb",
    3831: "anyrange",
    3838: "event_trigger",
    3904: "int4range",
    3906: "numrange",
    3908: "tsrange",
    3910: "tstzrange",
    3912: "daterange",
    3926: "int8range",
    4072: "jsonpath",
    4089: "regnamespace",
    4096: "regrole",
    4191: "regcollation",
    4451: "int4multirange",
    4532: "nummultirange",
    4533: "tsmultirange",
    4534: "tstzmultirange",
    4535: "datemultirange",
    4536: "int8multirange",
    4537: "anymultirange",
    4538: "anycompatiblemultirange",
    4600: "pg_brin_bloom_summary",
    4601: "pg_brin_minmax_multi_summary",
    5017: "pg_mcv_list",
    5038: "pg_snapshot",
    5069: "xid8",
    5077: "anycompatible",
    5078: "anycompatiblearray",
    5079: "anycompatiblenonarray",
    5080: "anycompatiblerange"
  };
  type;
  constructor(code) {
    super();
    this.type = _UnsupportedNativeDataType.typeNames[code] || "Unknown";
    this.message = `Unsupported column type ${this.type}`;
  }
};
function fieldToColumnType(fieldTypeId) {
  switch (fieldTypeId) {
    case ScalarColumnType.INT2:
    case ScalarColumnType.INT4:
      return ColumnTypeEnum.Int32;
    case ScalarColumnType.INT8:
      return ColumnTypeEnum.Int64;
    case ScalarColumnType.FLOAT4:
      return ColumnTypeEnum.Float;
    case ScalarColumnType.FLOAT8:
      return ColumnTypeEnum.Double;
    case ScalarColumnType.BOOL:
      return ColumnTypeEnum.Boolean;
    case ScalarColumnType.DATE:
      return ColumnTypeEnum.Date;
    case ScalarColumnType.TIME:
    case ScalarColumnType.TIMETZ:
      return ColumnTypeEnum.Time;
    case ScalarColumnType.TIMESTAMP:
    case ScalarColumnType.TIMESTAMPTZ:
      return ColumnTypeEnum.DateTime;
    case ScalarColumnType.NUMERIC:
    case ScalarColumnType.MONEY:
      return ColumnTypeEnum.Numeric;
    case ScalarColumnType.JSON:
    case ScalarColumnType.JSONB:
      return ColumnTypeEnum.Json;
    case ScalarColumnType.UUID:
      return ColumnTypeEnum.Uuid;
    case ScalarColumnType.OID:
      return ColumnTypeEnum.Int64;
    case ScalarColumnType.BPCHAR:
    case ScalarColumnType.TEXT:
    case ScalarColumnType.VARCHAR:
    case ScalarColumnType.BIT:
    case ScalarColumnType.VARBIT:
    case ScalarColumnType.INET:
    case ScalarColumnType.CIDR:
    case ScalarColumnType.XML:
    case AdditionalScalarColumnType.NAME:
      return ColumnTypeEnum.Text;
    case ScalarColumnType.BYTEA:
      return ColumnTypeEnum.Bytes;
    case ArrayColumnType.INT2_ARRAY:
    case ArrayColumnType.INT4_ARRAY:
      return ColumnTypeEnum.Int32Array;
    case ArrayColumnType.FLOAT4_ARRAY:
      return ColumnTypeEnum.FloatArray;
    case ArrayColumnType.FLOAT8_ARRAY:
      return ColumnTypeEnum.DoubleArray;
    case ArrayColumnType.NUMERIC_ARRAY:
    case ArrayColumnType.MONEY_ARRAY:
      return ColumnTypeEnum.NumericArray;
    case ArrayColumnType.BOOL_ARRAY:
      return ColumnTypeEnum.BooleanArray;
    case ArrayColumnType.CHAR_ARRAY:
      return ColumnTypeEnum.CharacterArray;
    case ArrayColumnType.BPCHAR_ARRAY:
    case ArrayColumnType.TEXT_ARRAY:
    case ArrayColumnType.VARCHAR_ARRAY:
    case ArrayColumnType.VARBIT_ARRAY:
    case ArrayColumnType.BIT_ARRAY:
    case ArrayColumnType.INET_ARRAY:
    case ArrayColumnType.CIDR_ARRAY:
    case ArrayColumnType.XML_ARRAY:
      return ColumnTypeEnum.TextArray;
    case ArrayColumnType.DATE_ARRAY:
      return ColumnTypeEnum.DateArray;
    case ArrayColumnType.TIME_ARRAY:
      return ColumnTypeEnum.TimeArray;
    case ArrayColumnType.TIMESTAMP_ARRAY:
      return ColumnTypeEnum.DateTimeArray;
    case ArrayColumnType.TIMESTAMPTZ_ARRAY:
      return ColumnTypeEnum.DateTimeArray;
    case ArrayColumnType.JSON_ARRAY:
    case ArrayColumnType.JSONB_ARRAY:
      return ColumnTypeEnum.JsonArray;
    case ArrayColumnType.BYTEA_ARRAY:
      return ColumnTypeEnum.BytesArray;
    case ArrayColumnType.UUID_ARRAY:
      return ColumnTypeEnum.UuidArray;
    case ArrayColumnType.INT8_ARRAY:
    case ArrayColumnType.OID_ARRAY:
      return ColumnTypeEnum.Int64Array;
    default:
      if (fieldTypeId >= FIRST_NORMAL_OBJECT_ID) {
        return ColumnTypeEnum.Text;
      }
      throw new UnsupportedNativeDataType(fieldTypeId);
  }
}
__name(fieldToColumnType, "fieldToColumnType");
function normalize_array(element_normalizer) {
  return (str) => (0, import_postgres_array.parse)(str, element_normalizer);
}
__name(normalize_array, "normalize_array");
function normalize_numeric(numeric) {
  return numeric;
}
__name(normalize_numeric, "normalize_numeric");
function normalize_date(date) {
  return date;
}
__name(normalize_date, "normalize_date");
function normalize_timestamp(time) {
  return `${time.replace(" ", "T")}+00:00`;
}
__name(normalize_timestamp, "normalize_timestamp");
function normalize_timestamptz(time) {
  return time.replace(" ", "T").replace(/[+-]\d{2}(:\d{2})?$/, "+00:00");
}
__name(normalize_timestamptz, "normalize_timestamptz");
function normalize_time(time) {
  return time;
}
__name(normalize_time, "normalize_time");
function normalize_timez(time) {
  return time.replace(/[+-]\d{2}(:\d{2})?$/, "");
}
__name(normalize_timez, "normalize_timez");
function normalize_money(money) {
  return money.slice(1);
}
__name(normalize_money, "normalize_money");
function normalize_xml(xml) {
  return xml;
}
__name(normalize_xml, "normalize_xml");
function toJson(json) {
  return json;
}
__name(toJson, "toJson");
var parsePgBytes = getTypeParser(ScalarColumnType.BYTEA);
var normalizeByteaArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY);
function convertBytes(serializedBytes) {
  return parsePgBytes(serializedBytes);
}
__name(convertBytes, "convertBytes");
function normalizeBit(bit) {
  return bit;
}
__name(normalizeBit, "normalizeBit");
var customParsers = {
  [ScalarColumnType.NUMERIC]: normalize_numeric,
  [ArrayColumnType.NUMERIC_ARRAY]: normalize_array(normalize_numeric),
  [ScalarColumnType.TIME]: normalize_time,
  [ArrayColumnType.TIME_ARRAY]: normalize_array(normalize_time),
  [ScalarColumnType.TIMETZ]: normalize_timez,
  [ScalarColumnType.DATE]: normalize_date,
  [ArrayColumnType.DATE_ARRAY]: normalize_array(normalize_date),
  [ScalarColumnType.TIMESTAMP]: normalize_timestamp,
  [ArrayColumnType.TIMESTAMP_ARRAY]: normalize_array(normalize_timestamp),
  [ScalarColumnType.TIMESTAMPTZ]: normalize_timestamptz,
  [ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalize_array(normalize_timestamptz),
  [ScalarColumnType.MONEY]: normalize_money,
  [ArrayColumnType.MONEY_ARRAY]: normalize_array(normalize_money),
  [ScalarColumnType.JSON]: toJson,
  [ArrayColumnType.JSON_ARRAY]: normalize_array(toJson),
  [ScalarColumnType.JSONB]: toJson,
  [ArrayColumnType.JSONB_ARRAY]: normalize_array(toJson),
  [ScalarColumnType.BYTEA]: convertBytes,
  [ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
  [ArrayColumnType.BIT_ARRAY]: normalize_array(normalizeBit),
  [ArrayColumnType.VARBIT_ARRAY]: normalize_array(normalizeBit),
  [ArrayColumnType.XML_ARRAY]: normalize_array(normalize_xml)
};
function mapArg(arg, argType) {
  if (arg === null) {
    return null;
  }
  if (Array.isArray(arg) && argType.arity === "list") {
    return arg.map((value) => mapArg(value, argType));
  }
  if (typeof arg === "string" && argType.scalarType === "datetime") {
    arg = new Date(arg);
  }
  if (arg instanceof Date) {
    switch (argType.dbType) {
      case "TIME":
      case "TIMETZ":
        return formatTime(arg);
      case "DATE":
        return formatDate(arg);
      default:
        return formatDateTime(arg);
    }
  }
  if (typeof arg === "string" && argType.scalarType === "bytes") {
    return Buffer.from(arg, "base64");
  }
  if (ArrayBuffer.isView(arg)) {
    return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
  }
  return arg;
}
__name(mapArg, "mapArg");
function formatDateTime(date) {
  const pad = /* @__PURE__ */ __name((n, z = 2) => String(n).padStart(z, "0"), "pad");
  const ms = date.getUTCMilliseconds();
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
__name(formatDateTime, "formatDateTime");
function formatDate(date) {
  const pad = /* @__PURE__ */ __name((n, z = 2) => String(n).padStart(z, "0"), "pad");
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
__name(formatDate, "formatDate");
function formatTime(date) {
  const pad = /* @__PURE__ */ __name((n, z = 2) => String(n).padStart(z, "0"), "pad");
  const ms = date.getUTCMilliseconds();
  return pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
__name(formatTime, "formatTime");
var TLS_ERRORS = /* @__PURE__ */ new Set([
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_CRL",
  "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
  "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
  "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
  "CERT_SIGNATURE_FAILURE",
  "CRL_SIGNATURE_FAILURE",
  "CERT_NOT_YET_VALID",
  "CERT_HAS_EXPIRED",
  "CRL_NOT_YET_VALID",
  "CRL_HAS_EXPIRED",
  "ERROR_IN_CERT_NOT_BEFORE_FIELD",
  "ERROR_IN_CERT_NOT_AFTER_FIELD",
  "ERROR_IN_CRL_LAST_UPDATE_FIELD",
  "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "CERT_CHAIN_TOO_LONG",
  "CERT_REVOKED",
  "INVALID_CA",
  "INVALID_PURPOSE",
  "CERT_UNTRUSTED",
  "CERT_REJECTED",
  "HOSTNAME_MISMATCH",
  "ERR_TLS_CERT_ALTNAME_FORMAT",
  "ERR_TLS_CERT_ALTNAME_INVALID"
]);
var SOCKET_ERRORS = /* @__PURE__ */ new Set(["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"]);
function convertDriverError(error) {
  if (isSocketError(error)) {
    return mapSocketError(error);
  }
  if (isTlsError(error)) {
    return {
      kind: "TlsConnectionError",
      reason: error.message
    };
  }
  if (isDriverError(error)) {
    return {
      originalCode: error.code,
      originalMessage: error.message,
      ...mapDriverError(error)
    };
  }
  throw error;
}
__name(convertDriverError, "convertDriverError");
function mapDriverError(error) {
  switch (error.code) {
    case "22001":
      return {
        kind: "LengthMismatch",
        column: error.column
      };
    case "22003":
      return {
        kind: "ValueOutOfRange",
        cause: error.message
      };
    case "22P02":
      return {
        kind: "InvalidInputValue",
        message: error.message
      };
    case "23505": {
      const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
      return {
        kind: "UniqueConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case "23502": {
      const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
      return {
        kind: "NullConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case "23503": {
      let constraint;
      if (error.column) {
        constraint = { fields: [error.column] };
      } else if (error.constraint) {
        constraint = { index: error.constraint };
      }
      return {
        kind: "ForeignKeyConstraintViolation",
        constraint
      };
    }
    case "3D000":
      return {
        kind: "DatabaseDoesNotExist",
        db: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "28000":
      return {
        kind: "DatabaseAccessDenied",
        db: error.message.split(",").find((s) => s.startsWith(" database"))?.split('"').at(1)
      };
    case "28P01":
      return {
        kind: "AuthenticationFailed",
        user: error.message.split(" ").pop()?.split('"').at(1)
      };
    case "40001":
      return {
        kind: "TransactionWriteConflict"
      };
    case "42P01":
      return {
        kind: "TableDoesNotExist",
        table: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "42703": {
      const rawColumn = error.message.match(/^column (.+) does not exist$/)?.at(1);
      return {
        kind: "ColumnNotFound",
        column: rawColumn?.replace(/"((?:""|[^"])*)"/g, (_, id) => id.replaceAll('""', '"'))
      };
    }
    case "42P04":
      return {
        kind: "DatabaseAlreadyExists",
        db: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "53300":
      return {
        kind: "TooManyConnections",
        cause: error.message
      };
    default:
      return {
        kind: "postgres",
        code: error.code ?? "N/A",
        severity: error.severity ?? "N/A",
        message: error.message,
        detail: error.detail,
        column: error.column,
        hint: error.hint
      };
  }
}
__name(mapDriverError, "mapDriverError");
function isDriverError(error) {
  return typeof error.code === "string" && typeof error.message === "string" && typeof error.severity === "string" && (typeof error.detail === "string" || error.detail === void 0) && (typeof error.column === "string" || error.column === void 0) && (typeof error.hint === "string" || error.hint === void 0);
}
__name(isDriverError, "isDriverError");
function mapSocketError(error) {
  switch (error.code) {
    case "ENOTFOUND":
    case "ECONNREFUSED":
      return {
        kind: "DatabaseNotReachable",
        host: error.address ?? error.hostname,
        port: error.port
      };
    case "ECONNRESET":
      return {
        kind: "ConnectionClosed"
      };
    case "ETIMEDOUT":
      return {
        kind: "SocketTimeout"
      };
  }
}
__name(mapSocketError, "mapSocketError");
function isSocketError(error) {
  return typeof error.code === "string" && typeof error.syscall === "string" && typeof error.errno === "number" && SOCKET_ERRORS.has(error.code);
}
__name(isSocketError, "isSocketError");
function isTlsError(error) {
  if (typeof error.code === "string") {
    return TLS_ERRORS.has(error.code);
  }
  switch (error.message) {
    case "The server does not support SSL connections":
    case "There was an error establishing an SSL connection":
      return true;
  }
  return false;
}
__name(isTlsError, "isTlsError");
var types22 = esm_default.types;
var debug2 = Debug2("prisma:driver-adapter:pg");
var PgQueryable = class {
  static {
    __name(this, "PgQueryable");
  }
  constructor(client, pgOptions) {
    this.client = client;
    this.pgOptions = pgOptions;
  }
  provider = "postgres";
  adapterName = name;
  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query) {
    const tag = "[js::query_raw]";
    debug2(`${tag} %O`, query);
    const { fields, rows } = await this.performIO(query);
    const columnNames = fields.map((field) => field.name);
    let columnTypes = [];
    try {
      columnTypes = fields.map((field) => fieldToColumnType(field.dataTypeID));
    } catch (e) {
      if (e instanceof UnsupportedNativeDataType) {
        throw new DriverAdapterError({
          kind: "UnsupportedNativeDataType",
          type: e.type
        });
      }
      throw e;
    }
    const udtParser = this.pgOptions?.userDefinedTypeParser;
    if (udtParser) {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.dataTypeID >= FIRST_NORMAL_OBJECT_ID && !Object.hasOwn(customParsers, field.dataTypeID)) {
          for (let j = 0; j < rows.length; j++) {
            rows[j][i] = await udtParser(field.dataTypeID, rows[j][i], this);
          }
        }
      }
    }
    return {
      columnNames,
      columnTypes,
      rows
    };
  }
  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query) {
    const tag = "[js::execute_raw]";
    debug2(`${tag} %O`, query);
    return (await this.performIO(query)).rowCount ?? 0;
  }
  /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */
  async performIO(query) {
    const { sql, args } = query;
    const values = args.map((arg, i) => mapArg(arg, query.argTypes[i]));
    try {
      const result = await this.client.query(
        {
          name: this.pgOptions?.statementNameGenerator?.(query),
          text: sql,
          values,
          rowMode: "array",
          types: {
            getTypeParser: /* @__PURE__ */ __name((oid, format) => {
              if (format === "text" && customParsers[oid]) {
                return customParsers[oid];
              }
              return types22.getTypeParser(oid, format);
            }, "getTypeParser")
          }
        },
        values
      );
      return result;
    } catch (e) {
      this.onError(e);
    }
  }
  onError(error) {
    debug2("Error in performIO: %O", error);
    throw new DriverAdapterError(convertDriverError(error));
  }
};
var PgTransaction = class extends PgQueryable {
  static {
    __name(this, "PgTransaction");
  }
  constructor(client, options, pgOptions, cleanup) {
    super(client, pgOptions);
    this.options = options;
    this.pgOptions = pgOptions;
    this.cleanup = cleanup;
  }
  async commit() {
    debug2(`[js::commit]`);
    this.cleanup?.();
    this.client.release();
  }
  async rollback() {
    debug2(`[js::rollback]`);
    this.cleanup?.();
    this.client.release();
  }
  async createSavepoint(name2) {
    await this.executeRaw({ sql: `SAVEPOINT ${name2}`, args: [], argTypes: [] });
  }
  async rollbackToSavepoint(name2) {
    await this.executeRaw({ sql: `ROLLBACK TO SAVEPOINT ${name2}`, args: [], argTypes: [] });
  }
  async releaseSavepoint(name2) {
    await this.executeRaw({ sql: `RELEASE SAVEPOINT ${name2}`, args: [], argTypes: [] });
  }
};
var PrismaPgAdapter = class extends PgQueryable {
  static {
    __name(this, "PrismaPgAdapter");
  }
  constructor(client, pgOptions, release) {
    super(client);
    this.pgOptions = pgOptions;
    this.release = release;
  }
  async startTransaction(isolationLevel) {
    const options = {
      usePhantomQuery: false
    };
    const tag = "[js::startTransaction]";
    debug2("%s options: %O", tag, options);
    const conn = await this.client.connect().catch((error) => this.onError(error));
    const onError = /* @__PURE__ */ __name((err) => {
      debug2(`Error from pool connection: ${err.message} %O`, err);
      this.pgOptions?.onConnectionError?.(err);
    }, "onError");
    conn.on("error", onError);
    const cleanup = /* @__PURE__ */ __name(() => {
      conn.removeListener("error", onError);
    }, "cleanup");
    try {
      const tx = new PgTransaction(conn, options, this.pgOptions, cleanup);
      await tx.executeRaw({ sql: "BEGIN", args: [], argTypes: [] });
      if (isolationLevel) {
        await tx.executeRaw({
          sql: `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
          args: [],
          argTypes: []
        });
      }
      return tx;
    } catch (error) {
      cleanup();
      conn.release(error);
      this.onError(error);
    }
  }
  async executeScript(script) {
    const statements = script.split(";").map((stmt) => stmt.trim()).filter((stmt) => stmt.length > 0);
    for (const stmt of statements) {
      try {
        await this.client.query(stmt);
      } catch (error) {
        this.onError(error);
      }
    }
  }
  getConnectionInfo() {
    return {
      schemaName: this.pgOptions?.schema,
      supportsRelationJoins: true
    };
  }
  async dispose() {
    return this.release?.();
  }
  underlyingDriver() {
    return this.client;
  }
};
var PrismaPgAdapterFactory = class {
  static {
    __name(this, "PrismaPgAdapterFactory");
  }
  constructor(poolOrConfig, options) {
    this.options = options;
    if (poolOrConfig instanceof esm_default.Pool) {
      this.externalPool = poolOrConfig;
      this.config = poolOrConfig.options;
    } else if (typeof poolOrConfig === "string") {
      this.externalPool = null;
      this.config = { connectionString: poolOrConfig };
    } else {
      this.externalPool = null;
      this.config = poolOrConfig;
    }
  }
  provider = "postgres";
  adapterName = name;
  config;
  externalPool;
  async connect() {
    const client = this.externalPool ?? new esm_default.Pool(this.config);
    const onIdleClientError = /* @__PURE__ */ __name((err) => {
      debug2(`Error from idle pool client: ${err.message} %O`, err);
      this.options?.onPoolError?.(err);
    }, "onIdleClientError");
    client.on("error", onIdleClientError);
    return new PrismaPgAdapter(client, this.options, async () => {
      if (this.externalPool) {
        if (this.options?.disposeExternalPool) {
          await this.externalPool.end();
          this.externalPool = null;
        } else {
          this.externalPool.removeListener("error", onIdleClientError);
        }
      } else {
        await client.end();
      }
    });
  }
  async connectToShadowDb() {
    const conn = await this.connect();
    const database = `prisma_migrate_shadow_db_${globalThis.crypto.randomUUID()}`;
    await conn.executeScript(`CREATE DATABASE "${database}"`);
    const client = new esm_default.Pool({ ...this.config, database });
    return new PrismaPgAdapter(client, void 0, async () => {
      await conn.executeScript(`DROP DATABASE "${database}"`);
      await client.end();
    });
  }
};

// lib/prisma.ts
var import_client = __toESM(require_default2());
var globalForPrisma = globalThis;
var connectionString = process.env.DATABASE_URL;
var prismaClientSingleton = /* @__PURE__ */ __name(() => {
  if (!connectionString) {
    console.error("DATABASE_URL must be set");
    process.exit(1);
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPgAdapterFactory(pool);
  return new import_client.PrismaClient({ adapter });
}, "prismaClientSingleton");
var prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export {
  prisma
};
/*! Bundled license information:

@prisma/client/runtime/library.js:
  (*! Bundled license information:
  
  decimal.js/decimal.mjs:
    (*!
     *  decimal.js v10.5.0
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     *)
  *)
*/
//# sourceMappingURL=prisma-VT3TJ2IL.mjs.map
