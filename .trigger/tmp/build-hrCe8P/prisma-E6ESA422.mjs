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
    function PostgresInterval(raw) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw);
      }
      extend(this, parse(raw));
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
            for (var k2 = 0; k2 < Math.floor(backslashes / 2); ++k2) {
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
    function allowNull(fn2) {
      return /* @__PURE__ */ __name(function nullAllowed(value) {
        if (value === null) return value;
        return fn2(value);
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
    function normalizeQueryConfig(config2, values, callback) {
      config2 = typeof config2 === "string" ? { text: config2 } : config2;
      if (values) {
        if (typeof values === "function") {
          config2.callback = values;
        } else {
          config2.values = values;
        }
      }
      if (callback) {
        config2.callback = callback;
      }
      return config2;
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
      } catch (e10) {
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
      return text.split("").map((_2, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
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
      return Buffer.from(a.map((_2, i) => a[i] ^ b[i]));
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
        const config3 = str.split(" ");
        return { host: config3[0], database: config3[1] };
      }
      const config2 = {};
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
        str = encodeURI(str).replace(/%25(\d\d)/g, "%$1");
      }
      try {
        try {
          result = new URL(str, "postgres://base");
        } catch (e10) {
          result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
          dummyHost = true;
        }
      } catch (err) {
        err.input && (err.input = "*****REDACTED*****");
        throw err;
      }
      for (const entry of result.searchParams.entries()) {
        config2[entry[0]] = entry[1];
      }
      config2.user = config2.user || decodeURIComponent(result.username);
      config2.password = config2.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config2.host = decodeURI(result.pathname);
        config2.database = result.searchParams.get("db");
        config2.client_encoding = result.searchParams.get("encoding");
        return config2;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config2.host) {
        config2.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config2.port) {
        config2.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config2.database = pathname ? decodeURI(pathname) : null;
      if (config2.ssl === "true" || config2.ssl === "1") {
        config2.ssl = true;
      }
      if (config2.ssl === "0") {
        config2.ssl = false;
      }
      if (config2.sslcert || config2.sslkey || config2.sslrootcert || config2.sslmode) {
        config2.ssl = {};
      }
      const fs2 = config2.sslcert || config2.sslkey || config2.sslrootcert ? __require("fs") : null;
      if (config2.sslcert) {
        config2.ssl.cert = fs2.readFileSync(config2.sslcert).toString();
      }
      if (config2.sslkey) {
        config2.ssl.key = fs2.readFileSync(config2.sslkey).toString();
      }
      if (config2.sslrootcert) {
        config2.ssl.ca = fs2.readFileSync(config2.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config2.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config2.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config2.sslmode) {
          case "disable": {
            config2.ssl = false;
            break;
          }
          case "prefer": {
            config2.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config2.sslrootcert) {
              config2.ssl.checkServerIdentity = function() {
              };
            } else {
              config2.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config2.ssl.ca) {
              throw new Error(
                "SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security."
              );
            }
            config2.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config2.sslmode) {
          case "disable": {
            config2.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            if (config2.sslmode !== "verify-full") {
              deprecatedSslModeWarning(config2.sslmode);
            }
            break;
          }
          case "no-verify": {
            config2.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config2;
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
    function toClientConfig(config2) {
      const poolConfig = Object.entries(config2).reduce((c, [key, value]) => {
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
              const v2 = parseInt(value, 10);
              if (isNaN(v2)) {
                throw new Error(`Invalid ${key}: ${value}`);
              }
              c[key] = v2;
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
    var val = /* @__PURE__ */ __name(function(key, config2, envVar) {
      if (config2[key]) {
        return config2[key];
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
    var add = /* @__PURE__ */ __name(function(params, config2, paramName) {
      const value = config2[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    }, "add");
    var ConnectionParameters = class {
      static {
        __name(this, "ConnectionParameters");
      }
      constructor(config2) {
        config2 = typeof config2 === "string" ? parse(config2) : config2 || {};
        if (config2.connectionString) {
          config2 = Object.assign({}, config2, parse(config2.connectionString));
        }
        this.user = val("user", config2);
        this.database = val("database", config2);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config2), 10);
        this.host = val("host", config2);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config2)
        });
        this.binary = val("binary", config2);
        this.options = val("options", config2);
        this.ssl = typeof config2.ssl === "undefined" ? readSSLConfigFromEnvironment() : config2.ssl;
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
        this.client_encoding = val("client_encoding", config2);
        this.replication = val("replication", config2);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config2, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config2, false);
        this.statement_timeout = val("statement_timeout", config2, false);
        this.lock_timeout = val("lock_timeout", config2, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config2, false);
        this.query_timeout = val("query_timeout", config2, false);
        if (config2.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config2.connectionTimeoutMillis / 1e3);
        }
        if (config2.keepAlive === false) {
          this.keepalives = 0;
        } else if (config2.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config2.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config2.keepAliveInitialDelayMillis / 1e3);
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
            const v2 = this.fields[i].format === "binary" ? Buffer.from(rawValue) : rawValue;
            row[field] = this._parsers[i](v2);
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
      constructor(config2, values, callback) {
        super();
        config2 = utils.normalizeQueryConfig(config2, values, callback);
        this.text = config2.text;
        this.values = config2.values;
        this.rows = config2.rows;
        this.types = config2.types;
        this.name = config2.name;
        this.queryMode = config2.queryMode;
        this.binary = config2.binary;
        this.portal = config2.portal || "";
        this.callback = config2.callback;
        this._rowMode = config2.rowMode;
        if (process.domain && config2.callback) {
          this.callback = process.domain.bind(config2.callback);
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
    var bind = /* @__PURE__ */ __name((config2 = {}) => {
      const portal = config2.portal || "";
      const statement = config2.statement || "";
      const binary = config2.binary || false;
      const values = config2.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      writeValues(values, config2.valueMapper);
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
    var execute = /* @__PURE__ */ __name((config2) => {
      if (!config2 || !config2.portal && !config2.rows) {
        return emptyExecute;
      }
      const portal = config2.portal || "";
      const rows = config2.rows || 0;
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
      constructor(config2) {
        super();
        config2 = config2 || {};
        this.stream = config2.stream || getStream(config2.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config2);
        }
        this._keepAlive = config2.keepAlive;
        this._keepAliveInitialDelayMillis = config2.keepAliveInitialDelayMillis;
        this.parsedStatements = {};
        this.ssl = config2.ssl || false;
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
      startup(config2) {
        this.stream.write(serialize.startup(config2));
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
      bind(config2) {
        this._send(serialize.bind(config2));
      }
      // send execute message
      execute(config2) {
        this._send(serialize.execute(config2));
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
    var path2 = __require("path");
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
      var env2 = rawEnv || process.env;
      var file = env2.PGPASSFILE || (isWin ? path2.join(env2.APPDATA || "./", "postgresql", "pgpass.conf") : path2.join(env2.HOME || "./", ".pgpass"));
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
        0: function(x2) {
          return x2.length > 0;
        },
        // port
        1: function(x2) {
          if (x2 === "*") {
            return true;
          }
          x2 = Number(x2);
          return isFinite(x2) && x2 > 0 && x2 < 9007199254740992 && Math.floor(x2) === x2;
        },
        // database
        2: function(x2) {
          return x2.length > 0;
        },
        // username
        3: function(x2) {
          return x2.length > 0;
        },
        // password
        4: function(x2) {
          return x2.length > 0;
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
    var path2 = __require("path");
    var fs2 = __require("fs");
    var helper = require_helper();
    module.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs2.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st2 = fs2.createReadStream(file);
        helper.getPassword(connInfo, st2, cb);
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
      constructor(config2) {
        super();
        this.connectionParameters = new ConnectionParameters(config2);
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
        const c = config2 || {};
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
          } catch (e10) {
            this.emit("error", e10);
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
          } catch (e10) {
            this.emit("error", e10);
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
      query(config2, values, callback) {
        let query;
        let result;
        let readTimeout;
        let readTimeoutTimer;
        let queryCallback;
        if (config2 === null || config2 === void 0) {
          throw new TypeError("Client was passed a null or undefined query");
        } else if (typeof config2.submit === "function") {
          readTimeout = config2.query_timeout || this.connectionParameters.query_timeout;
          result = query = config2;
          if (!query.callback) {
            if (typeof values === "function") {
              query.callback = values;
            } else if (callback) {
              query.callback = callback;
            }
          }
        } else {
          readTimeout = config2.query_timeout || this.connectionParameters.query_timeout;
          query = new Query2(config2, values, callback);
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
    var NativeQuery = module.exports = function(config2, values, callback) {
      EventEmitter.call(this);
      config2 = utils.normalizeQueryConfig(config2, values, callback);
      this.text = config2.text;
      this.values = config2.values;
      this.name = config2.name;
      this.queryMode = config2.queryMode;
      this.callback = config2.callback;
      this.state = "new";
      this._arrayMode = config2.rowMode === "array";
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
    } catch (e10) {
      throw e10;
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
    var Client2 = module.exports = function(config2) {
      EventEmitter.call(this);
      config2 = config2 || {};
      this._Promise = config2.Promise || global.Promise;
      this._types = new TypeOverrides2(config2.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp2 = this.connectionParameters = new ConnectionParameters(config2);
      if (config2.nativeConnectionString) cp2.nativeConnectionString = config2.nativeConnectionString;
      this.user = cp2.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp2.password
      });
      this.database = cp2.database;
      this.host = cp2.host;
      this.port = cp2.port;
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
    Client2.prototype.query = function(config2, values, callback) {
      let query;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config2 === null || config2 === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config2.submit === "function") {
        readTimeout = config2.query_timeout || this.connectionParameters.query_timeout;
        result = query = config2;
        if (typeof values === "function") {
          config2.callback = values;
        }
      } else {
        readTimeout = config2.query_timeout || this.connectionParameters.query_timeout;
        query = new NativeQuery(config2, values, callback);
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

// lib/prisma.ts
init_esm();

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
function init(x2, y2) {
  let rgx = new RegExp(`\\x1b\\[${y2}m`, "g");
  let open = `\x1B[${x2}m`, close = `\x1B[${y2}m`;
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
    get: /* @__PURE__ */ __name((_2, prop) => instanceProps[prop], "get"),
    set: /* @__PURE__ */ __name((_2, prop, value) => instanceProps[prop] = value, "set")
  });
}
__name(debugCreate, "debugCreate");
var Debug = new Proxy(debugCreate, {
  get: /* @__PURE__ */ __name((_2, prop) => topProps[prop], "get"),
  set: /* @__PURE__ */ __name((_2, prop, value) => topProps[prop] = value, "set")
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
var debug = Debug("driver-adapter-utils");
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
  const pad = /* @__PURE__ */ __name((n, z2 = 2) => String(n).padStart(z2, "0"), "pad");
  const ms = date.getUTCMilliseconds();
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms ? "." + String(ms).padStart(3, "0") : "");
}
__name(formatDateTime, "formatDateTime");
function formatDate(date) {
  const pad = /* @__PURE__ */ __name((n, z2 = 2) => String(n).padStart(z2, "0"), "pad");
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
__name(formatDate, "formatDate");
function formatTime(date) {
  const pad = /* @__PURE__ */ __name((n, z2 = 2) => String(n).padStart(z2, "0"), "pad");
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
        column: rawColumn?.replace(/"((?:""|[^"])*)"/g, (_2, id2) => id2.replaceAll('""', '"'))
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
var debug2 = Debug("prisma:driver-adapter:pg");
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
    } catch (e10) {
      if (e10 instanceof UnsupportedNativeDataType) {
        throw new DriverAdapterError({
          kind: "UnsupportedNativeDataType",
          type: e10.type
        });
      }
      throw e10;
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
    } catch (e10) {
      this.onError(e10);
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

// app/generated/prisma/client.ts
init_esm();
import * as process3 from "node:process";
import * as path from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// app/generated/prisma/internal/class.ts
init_esm();

// node_modules/@prisma/client/runtime/library.mjs
init_esm();
import * as __banner_node_module from "node:module";
import * as __banner_node_path from "node:path";
import * as process2 from "node:process";
import * as __banner_node_url from "node:url";
import Ru from "node:fs";
import ku from "node:child_process";
import Bo from "node:fs/promises";
import ni from "node:os";
import { promisify as _u } from "node:util";
import si from "node:process";
import M from "node:path";
import as from "node:fs";
import tn from "node:path";
import Ci from "node:fs";
import nt from "node:path";
import td from "node:fs";
import { AsyncResource as Df } from "node:async_hooks";
import { EventEmitter as Of } from "node:events";
import kf from "node:fs";
import Po from "node:path";
import Fm from "node:fs";
import jn from "node:path";
import wl from "node:os";
import af from "node:path";
var __filename = __banner_node_url.fileURLToPath(import.meta.url);
globalThis["__dirname"] = __banner_node_path.dirname(__filename);
var require2 = __banner_node_module.createRequire(import.meta.url);
var Xl = Object.create;
var Kn = Object.defineProperty;
var eu = Object.getOwnPropertyDescriptor;
var ru = Object.getOwnPropertyNames;
var tu = Object.getPrototypeOf;
var nu = Object.prototype.hasOwnProperty;
var fr = ((e10) => typeof require2 < "u" ? require2 : typeof Proxy < "u" ? new Proxy(e10, { get: /* @__PURE__ */ __name((r, t) => (typeof require2 < "u" ? require2 : r)[t], "get") }) : e10)(function(e10) {
  if (typeof require2 < "u") return require2.apply(this, arguments);
  throw Error('Dynamic require of "' + e10 + '" is not supported');
});
var To = /* @__PURE__ */ __name((e10, r) => () => (e10 && (r = e10(e10 = 0)), r), "To");
var ae = /* @__PURE__ */ __name((e10, r) => () => (r || e10((r = { exports: {} }).exports, r), r.exports), "ae");
var gr = /* @__PURE__ */ __name((e10, r) => {
  for (var t in r) Kn(e10, t, { get: r[t], enumerable: true });
}, "gr");
var iu = /* @__PURE__ */ __name((e10, r, t, n) => {
  if (r && typeof r == "object" || typeof r == "function") for (let i of ru(r)) !nu.call(e10, i) && i !== t && Kn(e10, i, { get: /* @__PURE__ */ __name(() => r[i], "get"), enumerable: !(n = eu(r, i)) || n.enumerable });
  return e10;
}, "iu");
var le = /* @__PURE__ */ __name((e10, r, t) => (t = e10 != null ? Xl(tu(e10)) : {}, iu(r || !e10 || !e10.__esModule ? Kn(t, "default", { value: e10, enumerable: true }) : t, e10)), "le");
var ai = ae(($g, zo) => {
  "use strict";
  zo.exports = (e10, r = process2.argv) => {
    let t = e10.startsWith("-") ? "" : e10.length === 1 ? "-" : "--", n = r.indexOf(t + e10), i = r.indexOf("--");
    return n !== -1 && (i === -1 || n < i);
  };
});
var es = ae((qg, Xo) => {
  "use strict";
  var xc = fr("node:os"), Zo = fr("node:tty"), pe = ai(), { env: U } = process2, Ge;
  pe("no-color") || pe("no-colors") || pe("color=false") || pe("color=never") ? Ge = 0 : (pe("color") || pe("colors") || pe("color=true") || pe("color=always")) && (Ge = 1);
  "FORCE_COLOR" in U && (U.FORCE_COLOR === "true" ? Ge = 1 : U.FORCE_COLOR === "false" ? Ge = 0 : Ge = U.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(U.FORCE_COLOR, 10), 3));
  function li(e10) {
    return e10 === 0 ? false : { level: e10, hasBasic: true, has256: e10 >= 2, has16m: e10 >= 3 };
  }
  __name(li, "li");
  function ui(e10, r) {
    if (Ge === 0) return 0;
    if (pe("color=16m") || pe("color=full") || pe("color=truecolor")) return 3;
    if (pe("color=256")) return 2;
    if (e10 && !r && Ge === void 0) return 0;
    let t = Ge || 0;
    if (U.TERM === "dumb") return t;
    if (process2.platform === "win32") {
      let n = xc.release().split(".");
      return Number(n[0]) >= 10 && Number(n[2]) >= 10586 ? Number(n[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in U) return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((n) => n in U) || U.CI_NAME === "codeship" ? 1 : t;
    if ("TEAMCITY_VERSION" in U) return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(U.TEAMCITY_VERSION) ? 1 : 0;
    if (U.COLORTERM === "truecolor") return 3;
    if ("TERM_PROGRAM" in U) {
      let n = parseInt((U.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (U.TERM_PROGRAM) {
        case "iTerm.app":
          return n >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(U.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(U.TERM) || "COLORTERM" in U ? 1 : t;
  }
  __name(ui, "ui");
  function vc(e10) {
    let r = ui(e10, e10 && e10.isTTY);
    return li(r);
  }
  __name(vc, "vc");
  Xo.exports = { supportsColor: vc, stdout: li(ui(true, Zo.isatty(1))), stderr: li(ui(true, Zo.isatty(2))) };
});
var ns = ae((Vg, ts) => {
  "use strict";
  var Pc = es(), Er = ai();
  function rs(e10) {
    if (/^\d{3,4}$/.test(e10)) {
      let t = /(\d{1,2})(\d{2})/.exec(e10) || [];
      return { major: 0, minor: parseInt(t[1], 10), patch: parseInt(t[2], 10) };
    }
    let r = (e10 || "").split(".").map((t) => parseInt(t, 10));
    return { major: r[0], minor: r[1], patch: r[2] };
  }
  __name(rs, "rs");
  function ci(e10) {
    let { CI: r, FORCE_HYPERLINK: t, NETLIFY: n, TEAMCITY_VERSION: i, TERM_PROGRAM: o, TERM_PROGRAM_VERSION: s, VTE_VERSION: a, TERM: l } = process2.env;
    if (t) return !(t.length > 0 && parseInt(t, 10) === 0);
    if (Er("no-hyperlink") || Er("no-hyperlinks") || Er("hyperlink=false") || Er("hyperlink=never")) return false;
    if (Er("hyperlink=true") || Er("hyperlink=always") || n) return true;
    if (!Pc.supportsColor(e10) || e10 && !e10.isTTY) return false;
    if ("WT_SESSION" in process2.env) return true;
    if (process2.platform === "win32" || r || i) return false;
    if (o) {
      let u = rs(s || "");
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
      let u = rs(a);
      return u.major > 0 || u.minor >= 50;
    }
    switch (l) {
      case "alacritty":
        return true;
    }
    return false;
  }
  __name(ci, "ci");
  ts.exports = { supportsHyperlink: ci, stdout: ci(process2.stdout), stderr: ci(process2.stderr) };
});
var is = ae((Xg, Tc) => {
  Tc.exports = { name: "@prisma/internals", version: "6.19.3", description: "This package is intended for Prisma's internal use", main: "dist/index.js", types: "dist/index.d.ts", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/internals" }, homepage: "https://www.prisma.io", author: "Tim Suchanek <suchanek@prisma.io>", bugs: "https://github.com/prisma/prisma/issues", license: "Apache-2.0", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", test: "dotenv -e ../../.db.env -- jest --silent", prepublishOnly: "pnpm run build" }, files: ["README.md", "dist", "!**/libquery_engine*", "!dist/get-generators/engines/*", "scripts"], devDependencies: { "@babel/helper-validator-identifier": "7.25.9", "@opentelemetry/api": "1.9.0", "@swc/core": "1.11.5", "@swc/jest": "0.2.37", "@types/babel__helper-validator-identifier": "7.15.2", "@types/jest": "29.5.14", "@types/node": "18.19.76", "@types/resolve": "1.20.6", archiver: "6.0.2", "checkpoint-client": "1.1.33", "cli-truncate": "4.0.0", dotenv: "16.5.0", empathic: "2.0.0", "escape-string-regexp": "5.0.0", execa: "8.0.1", "fast-glob": "3.3.3", "find-up": "7.0.0", "fp-ts": "2.16.9", "fs-extra": "11.3.0", "global-directory": "4.0.0", globby: "11.1.0", "identifier-regex": "1.0.0", "indent-string": "4.0.0", "is-windows": "1.0.2", "is-wsl": "3.1.0", jest: "29.7.0", "jest-junit": "16.0.0", kleur: "4.1.5", "mock-stdin": "1.0.0", "new-github-issue-url": "0.2.1", "node-fetch": "3.3.2", "npm-packlist": "5.1.3", open: "7.4.2", "p-map": "4.0.0", resolve: "1.22.10", "string-width": "7.2.0", "strip-indent": "4.0.0", "temp-dir": "2.0.0", tempy: "1.0.1", "terminal-link": "4.0.0", tmp: "0.2.3", "ts-pattern": "5.6.2", "ts-toolbelt": "9.6.0", typescript: "5.4.5", yarn: "1.22.22" }, dependencies: { "@prisma/config": "workspace:*", "@prisma/debug": "workspace:*", "@prisma/dmmf": "workspace:*", "@prisma/driver-adapter-utils": "workspace:*", "@prisma/engines": "workspace:*", "@prisma/fetch-engine": "workspace:*", "@prisma/generator": "workspace:*", "@prisma/generator-helper": "workspace:*", "@prisma/get-platform": "workspace:*", "@prisma/prisma-schema-wasm": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/schema-engine-wasm": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/schema-files-loader": "workspace:*", arg: "5.0.2", prompts: "2.4.2" }, peerDependencies: { typescript: ">=5.1.0" }, peerDependenciesMeta: { typescript: { optional: true } }, sideEffects: false };
});
var gi = ae((wh, Dc) => {
  Dc.exports = { name: "@prisma/engines-version", version: "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "c2990dca591cba766e3b7ef5d9e8a84796e47ab7" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
});
var Zt = ae((zt) => {
  "use strict";
  Object.defineProperty(zt, "__esModule", { value: true });
  zt.enginesVersion = void 0;
  zt.enginesVersion = gi().prisma.enginesVersion;
});
var cs = ae((Fh, us) => {
  "use strict";
  us.exports = (e10) => {
    let r = e10.match(/^[ \t]*(?=\S)/gm);
    return r ? r.reduce((t, n) => Math.min(t, n.length), 1 / 0) : 0;
  };
});
var wi = ae((qh, ms) => {
  "use strict";
  ms.exports = (e10, r = 1, t) => {
    if (t = { indent: " ", includeEmptyLines: false, ...t }, typeof e10 != "string") throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e10}\``);
    if (typeof r != "number") throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof r}\``);
    if (typeof t.indent != "string") throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof t.indent}\``);
    if (r === 0) return e10;
    let n = t.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
    return e10.replace(n, t.indent.repeat(r));
  };
});
var hs = ae((Hh, jc) => {
  jc.exports = { name: "dotenv", version: "16.5.0", description: "Loads environment variables from .env file", main: "lib/main.js", types: "lib/main.d.ts", exports: { ".": { types: "./lib/main.d.ts", require: "./lib/main.js", default: "./lib/main.js" }, "./config": "./config.js", "./config.js": "./config.js", "./lib/env-options": "./lib/env-options.js", "./lib/env-options.js": "./lib/env-options.js", "./lib/cli-options": "./lib/cli-options.js", "./lib/cli-options.js": "./lib/cli-options.js", "./package.json": "./package.json" }, scripts: { "dts-check": "tsc --project tests/types/tsconfig.json", lint: "standard", pretest: "npm run lint && npm run dts-check", test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000", "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov", prerelease: "npm test", release: "standard-version" }, repository: { type: "git", url: "git://github.com/motdotla/dotenv.git" }, homepage: "https://github.com/motdotla/dotenv#readme", funding: "https://dotenvx.com", keywords: ["dotenv", "env", ".env", "environment", "variables", "config", "settings"], readmeFilename: "README.md", license: "BSD-2-Clause", devDependencies: { "@types/node": "^18.11.3", decache: "^4.6.2", sinon: "^14.0.1", standard: "^17.0.0", "standard-version": "^9.5.0", tap: "^19.2.0", typescript: "^4.8.4" }, engines: { node: ">=12" }, browser: { fs: false } };
});
var xs = ae((Yh, _e) => {
  "use strict";
  var Ri = fr("node:fs"), Ai = fr("node:path"), Bc = fr("node:os"), Uc = fr("node:crypto"), Gc = hs(), bs = Gc.version, Qc = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
  function Wc(e10) {
    let r = {}, t = e10.toString();
    t = t.replace(/\r\n?/mg, `
`);
    let n;
    for (; (n = Qc.exec(t)) != null; ) {
      let i = n[1], o = n[2] || "";
      o = o.trim();
      let s = o[0];
      o = o.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), s === '"' && (o = o.replace(/\\n/g, `
`), o = o.replace(/\\r/g, "\r")), r[i] = o;
    }
    return r;
  }
  __name(Wc, "Wc");
  function Jc(e10) {
    let r = ws(e10), t = j.configDotenv({ path: r });
    if (!t.parsed) {
      let s = new Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);
      throw s.code = "MISSING_DATA", s;
    }
    let n = Es(e10).split(","), i = n.length, o;
    for (let s = 0; s < i; s++) try {
      let a = n[s].trim(), l = Hc(t, a);
      o = j.decrypt(l.ciphertext, l.key);
      break;
    } catch (a) {
      if (s + 1 >= i) throw a;
    }
    return j.parse(o);
  }
  __name(Jc, "Jc");
  function Kc(e10) {
    console.log(`[dotenv@${bs}][WARN] ${e10}`);
  }
  __name(Kc, "Kc");
  function tt(e10) {
    console.log(`[dotenv@${bs}][DEBUG] ${e10}`);
  }
  __name(tt, "tt");
  function Es(e10) {
    return e10 && e10.DOTENV_KEY && e10.DOTENV_KEY.length > 0 ? e10.DOTENV_KEY : process2.env.DOTENV_KEY && process2.env.DOTENV_KEY.length > 0 ? process2.env.DOTENV_KEY : "";
  }
  __name(Es, "Es");
  function Hc(e10, r) {
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
    let o = `DOTENV_VAULT_${i.toUpperCase()}`, s = e10.parsed[o];
    if (!s) {
      let a = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${o} in your .env.vault file.`);
      throw a.code = "NOT_FOUND_DOTENV_ENVIRONMENT", a;
    }
    return { ciphertext: s, key: n };
  }
  __name(Hc, "Hc");
  function ws(e10) {
    let r = null;
    if (e10 && e10.path && e10.path.length > 0) if (Array.isArray(e10.path)) for (let t of e10.path) Ri.existsSync(t) && (r = t.endsWith(".vault") ? t : `${t}.vault`);
    else r = e10.path.endsWith(".vault") ? e10.path : `${e10.path}.vault`;
    else r = Ai.resolve(process2.cwd(), ".env.vault");
    return Ri.existsSync(r) ? r : null;
  }
  __name(ws, "ws");
  function ys(e10) {
    return e10[0] === "~" ? Ai.join(Bc.homedir(), e10.slice(1)) : e10;
  }
  __name(ys, "ys");
  function Yc(e10) {
    !!(e10 && e10.debug) && tt("Loading env from encrypted .env.vault");
    let t = j._parseVault(e10), n = process2.env;
    return e10 && e10.processEnv != null && (n = e10.processEnv), j.populate(n, t, e10), { parsed: t };
  }
  __name(Yc, "Yc");
  function zc(e10) {
    let r = Ai.resolve(process2.cwd(), ".env"), t = "utf8", n = !!(e10 && e10.debug);
    e10 && e10.encoding ? t = e10.encoding : n && tt("No encoding is specified. UTF-8 is used by default");
    let i = [r];
    if (e10 && e10.path) if (!Array.isArray(e10.path)) i = [ys(e10.path)];
    else {
      i = [];
      for (let l of e10.path) i.push(ys(l));
    }
    let o, s = {};
    for (let l of i) try {
      let u = j.parse(Ri.readFileSync(l, { encoding: t }));
      j.populate(s, u, e10);
    } catch (u) {
      n && tt(`Failed to load ${l} ${u.message}`), o = u;
    }
    let a = process2.env;
    return e10 && e10.processEnv != null && (a = e10.processEnv), j.populate(a, s, e10), o ? { parsed: s, error: o } : { parsed: s };
  }
  __name(zc, "zc");
  function Zc(e10) {
    if (Es(e10).length === 0) return j.configDotenv(e10);
    let r = ws(e10);
    return r ? j._configVault(e10) : (Kc(`You set DOTENV_KEY but you are missing a .env.vault file at ${r}. Did you forget to build it?`), j.configDotenv(e10));
  }
  __name(Zc, "Zc");
  function Xc(e10, r) {
    let t = Buffer.from(r.slice(-64), "hex"), n = Buffer.from(e10, "base64"), i = n.subarray(0, 12), o = n.subarray(-16);
    n = n.subarray(12, -16);
    try {
      let s = Uc.createDecipheriv("aes-256-gcm", t, i);
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
  __name(Xc, "Xc");
  function ep(e10, r, t = {}) {
    let n = !!(t && t.debug), i = !!(t && t.override);
    if (typeof r != "object") {
      let o = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
      throw o.code = "OBJECT_REQUIRED", o;
    }
    for (let o of Object.keys(r)) Object.prototype.hasOwnProperty.call(e10, o) ? (i === true && (e10[o] = r[o]), n && tt(i === true ? `"${o}" is already defined and WAS overwritten` : `"${o}" is already defined and was NOT overwritten`)) : e10[o] = r[o];
  }
  __name(ep, "ep");
  var j = { configDotenv: zc, _configVault: Yc, _parseVault: Jc, config: Zc, decrypt: Xc, parse: Wc, populate: ep };
  _e.exports.configDotenv = j.configDotenv;
  _e.exports._configVault = j._configVault;
  _e.exports._parseVault = j._parseVault;
  _e.exports.config = j.config;
  _e.exports.decrypt = j.decrypt;
  _e.exports.parse = j.parse;
  _e.exports.populate = j.populate;
  _e.exports = j;
});
var Ss = ae((iy, nn) => {
  "use strict";
  nn.exports = (e10 = {}) => {
    let r;
    if (e10.repoUrl) r = e10.repoUrl;
    else if (e10.user && e10.repo) r = `https://github.com/${e10.user}/${e10.repo}`;
    else throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
    let t = new URL(`${r}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
    for (let i of n) {
      let o = e10[i];
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
  nn.exports.default = nn.exports;
});
var qi = ae((_b, Ws) => {
  "use strict";
  Ws.exports = /* @__PURE__ */ function() {
    function e10(r, t, n, i, o) {
      return r < t || n < t ? r > n ? n + 1 : r + 1 : i === o ? t : t + 1;
    }
    __name(e10, "e");
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
      for (var me = D.length - 1; a < o - 3; ) for (I = t.charCodeAt(s + (u = a)), T = t.charCodeAt(s + (c = a + 1)), S = t.charCodeAt(s + (p = a + 2)), b = t.charCodeAt(s + (d = a + 3)), f = a += 4, l = 0; l < me; l += 2) h = D[l], g = D[l + 1], u = e10(h, u, c, I, g), c = e10(u, c, p, T, g), p = e10(c, p, d, S, g), f = e10(p, d, f, b, g), D[l] = f, d = p, p = c, c = u, u = h;
      for (; a < o; ) for (I = t.charCodeAt(s + (u = a)), f = ++a, l = 0; l < me; l += 2) h = D[l], D[l] = f = e10(h, u, f, I, D[l + 1]), u = h;
      return f;
    };
  }();
});
var zs = To(() => {
  "use strict";
});
var Zs = To(() => {
  "use strict";
});
var Ao = {};
gr(Ao, { defineExtension: /* @__PURE__ */ __name(() => So, "defineExtension"), getExtensionContext: /* @__PURE__ */ __name(() => Ro, "getExtensionContext") });
function So(e10) {
  return typeof e10 == "function" ? e10 : (r) => r.$extends(e10);
}
__name(So, "So");
function Ro(e10) {
  return e10;
}
__name(Ro, "Ro");
var Io = {};
gr(Io, { validator: /* @__PURE__ */ __name(() => Co, "validator") });
function Co(...e10) {
  return (r) => r;
}
__name(Co, "Co");
var $t = {};
gr($t, { $: /* @__PURE__ */ __name(() => No, "$"), bgBlack: /* @__PURE__ */ __name(() => fu, "bgBlack"), bgBlue: /* @__PURE__ */ __name(() => bu, "bgBlue"), bgCyan: /* @__PURE__ */ __name(() => wu, "bgCyan"), bgGreen: /* @__PURE__ */ __name(() => hu, "bgGreen"), bgMagenta: /* @__PURE__ */ __name(() => Eu, "bgMagenta"), bgRed: /* @__PURE__ */ __name(() => gu, "bgRed"), bgWhite: /* @__PURE__ */ __name(() => xu, "bgWhite"), bgYellow: /* @__PURE__ */ __name(() => yu, "bgYellow"), black: /* @__PURE__ */ __name(() => cu, "black"), blue: /* @__PURE__ */ __name(() => tr, "blue"), bold: /* @__PURE__ */ __name(() => Q, "bold"), cyan: /* @__PURE__ */ __name(() => De, "cyan"), dim: /* @__PURE__ */ __name(() => Ce, "dim"), gray: /* @__PURE__ */ __name(() => Jr, "gray"), green: /* @__PURE__ */ __name(() => $e, "green"), grey: /* @__PURE__ */ __name(() => mu, "grey"), hidden: /* @__PURE__ */ __name(() => lu, "hidden"), inverse: /* @__PURE__ */ __name(() => au, "inverse"), italic: /* @__PURE__ */ __name(() => su, "italic"), magenta: /* @__PURE__ */ __name(() => pu, "magenta"), red: /* @__PURE__ */ __name(() => ue, "red"), reset: /* @__PURE__ */ __name(() => ou, "reset"), strikethrough: /* @__PURE__ */ __name(() => uu, "strikethrough"), underline: /* @__PURE__ */ __name(() => H, "underline"), white: /* @__PURE__ */ __name(() => du, "white"), yellow: /* @__PURE__ */ __name(() => Ie, "yellow") });
var Hn;
var Do;
var Oo;
var ko;
var _o = true;
typeof process2 < "u" && ({ FORCE_COLOR: Hn, NODE_DISABLE_COLORS: Do, NO_COLOR: Oo, TERM: ko } = process2.env || {}, _o = process2.stdout && process2.stdout.isTTY);
var No = { enabled: !Do && Oo == null && ko !== "dumb" && (Hn != null && Hn !== "0" || _o) };
function N(e10, r) {
  let t = new RegExp(`\\x1b\\[${r}m`, "g"), n = `\x1B[${e10}m`, i = `\x1B[${r}m`;
  return function(o) {
    return !No.enabled || o == null ? o : n + (~("" + o).indexOf(i) ? o.replace(t, i + n) : o) + i;
  };
}
__name(N, "N");
var ou = N(0, 0);
var Q = N(1, 22);
var Ce = N(2, 22);
var su = N(3, 23);
var H = N(4, 24);
var au = N(7, 27);
var lu = N(8, 28);
var uu = N(9, 29);
var cu = N(30, 39);
var ue = N(31, 39);
var $e = N(32, 39);
var Ie = N(33, 39);
var tr = N(34, 39);
var pu = N(35, 39);
var De = N(36, 39);
var du = N(37, 39);
var Jr = N(90, 39);
var mu = N(90, 39);
var fu = N(40, 49);
var gu = N(41, 49);
var hu = N(42, 49);
var yu = N(43, 49);
var bu = N(44, 49);
var Eu = N(45, 49);
var wu = N(46, 49);
var xu = N(47, 49);
var vu = 100;
var Lo = ["green", "yellow", "blue", "magenta", "cyan", "red"];
var Kr = [];
var Fo = Date.now();
var Pu = 0;
var Yn = typeof process2 < "u" ? process2.env : {};
globalThis.DEBUG ??= Yn.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= Yn.DEBUG_COLORS ? Yn.DEBUG_COLORS === "true" : true;
var Hr = { enable(e10) {
  typeof e10 == "string" && (globalThis.DEBUG = e10);
}, disable() {
  let e10 = globalThis.DEBUG;
  return globalThis.DEBUG = "", e10;
}, enabled(e10) {
  let r = globalThis.DEBUG.split(",").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), t = r.some((i) => i === "" || i[0] === "-" ? false : e10.match(RegExp(i.split("*").join(".*") + "$"))), n = r.some((i) => i === "" || i[0] !== "-" ? false : e10.match(RegExp(i.slice(1).split("*").join(".*") + "$")));
  return t && !n;
}, log: /* @__PURE__ */ __name((...e10) => {
  let [r, t, ...n] = e10;
  (console.warn ?? console.log)(`${r} ${t}`, ...n);
}, "log"), formatters: {} };
function Tu(e10) {
  let r = { color: Lo[Pu++ % Lo.length], enabled: Hr.enabled(e10), namespace: e10, log: Hr.log, extend: /* @__PURE__ */ __name(() => {
  }, "extend") }, t = /* @__PURE__ */ __name((...n) => {
    let { enabled: i, namespace: o, color: s, log: a } = r;
    if (n.length !== 0 && Kr.push([o, ...n]), Kr.length > vu && Kr.shift(), Hr.enabled(o) || i) {
      let l = n.map((c) => typeof c == "string" ? c : Su(c)), u = `+${Date.now() - Fo}ms`;
      Fo = Date.now(), globalThis.DEBUG_COLORS ? a($t[s](Q(o)), ...l, $t[s](u)) : a(o, ...l, u);
    }
  }, "t");
  return new Proxy(t, { get: /* @__PURE__ */ __name((n, i) => r[i], "get"), set: /* @__PURE__ */ __name((n, i, o) => r[i] = o, "set") });
}
__name(Tu, "Tu");
var L = new Proxy(Tu, { get: /* @__PURE__ */ __name((e10, r) => Hr[r], "get"), set: /* @__PURE__ */ __name((e10, r, t) => Hr[r] = t, "set") });
function Su(e10, r = 2) {
  let t = /* @__PURE__ */ new Set();
  return JSON.stringify(e10, (n, i) => {
    if (typeof i == "object" && i !== null) {
      if (t.has(i)) return "[Circular *]";
      t.add(i);
    } else if (typeof i == "bigint") return i.toString();
    return i;
  }, r);
}
__name(Su, "Su");
function Mo(e10 = 7500) {
  let r = Kr.map(([t, ...n]) => `${t} ${n.map((i) => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
  return r.length < e10 ? r : r.slice(-e10);
}
__name(Mo, "Mo");
function $o() {
  Kr.length = 0;
}
__name($o, "$o");
var hr = L;
function zn() {
  let e10 = process2.env.PRISMA_QUERY_ENGINE_LIBRARY;
  if (!(e10 && Ru.existsSync(e10)) && process2.arch === "ia32") throw new Error('The default query engine type (Node-API, "library") is currently not supported for 32bit Node. Please set `engineType = "binary"` in the "generator" block of your "schema.prisma" file (or use the environment variables "PRISMA_CLIENT_ENGINE_TYPE=binary" and/or "PRISMA_CLI_QUERY_ENGINE_TYPE=binary".)');
}
__name(zn, "zn");
var Zn = ["darwin", "darwin-arm64", "debian-openssl-1.0.x", "debian-openssl-1.1.x", "debian-openssl-3.0.x", "rhel-openssl-1.0.x", "rhel-openssl-1.1.x", "rhel-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-arm64-openssl-1.0.x", "linux-arm64-openssl-3.0.x", "linux-arm-openssl-1.1.x", "linux-arm-openssl-1.0.x", "linux-arm-openssl-3.0.x", "linux-musl", "linux-musl-openssl-3.0.x", "linux-musl-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "linux-nixos", "linux-static-x64", "linux-static-arm64", "windows", "freebsd11", "freebsd12", "freebsd13", "freebsd14", "freebsd15", "openbsd", "netbsd", "arm"];
var qt = "libquery_engine";
function Vt(e10, r) {
  let t = r === "url";
  return e10.includes("windows") ? t ? "query_engine.dll.node" : `query_engine-${e10}.dll.node` : e10.includes("darwin") ? t ? `${qt}.dylib.node` : `${qt}-${e10}.dylib.node` : t ? `${qt}.so.node` : `${qt}-${e10}.so.node`;
}
__name(Vt, "Vt");
var Oe = Symbol.for("@ts-pattern/matcher");
var Au = Symbol.for("@ts-pattern/isVariadic");
var Bt = "@ts-pattern/anonymous-select-key";
var Xn = /* @__PURE__ */ __name((e10) => !!(e10 && typeof e10 == "object"), "Xn");
var jt = /* @__PURE__ */ __name((e10) => e10 && !!e10[Oe], "jt");
var Ee = /* @__PURE__ */ __name((e10, r, t) => {
  if (jt(e10)) {
    let n = e10[Oe](), { matched: i, selections: o } = n.match(r);
    return i && o && Object.keys(o).forEach((s) => t(s, o[s])), i;
  }
  if (Xn(e10)) {
    if (!Xn(r)) return false;
    if (Array.isArray(e10)) {
      if (!Array.isArray(r)) return false;
      let n = [], i = [], o = [];
      for (let s of e10.keys()) {
        let a = e10[s];
        jt(a) && a[Au] ? o.push(a) : o.length ? i.push(a) : n.push(a);
      }
      if (o.length) {
        if (o.length > 1) throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (r.length < n.length + i.length) return false;
        let s = r.slice(0, n.length), a = i.length === 0 ? [] : r.slice(-i.length), l = r.slice(n.length, i.length === 0 ? 1 / 0 : -i.length);
        return n.every((u, c) => Ee(u, s[c], t)) && i.every((u, c) => Ee(u, a[c], t)) && (o.length === 0 || Ee(o[0], l, t));
      }
      return e10.length === r.length && e10.every((s, a) => Ee(s, r[a], t));
    }
    return Reflect.ownKeys(e10).every((n) => {
      let i = e10[n];
      return (n in r || jt(o = i) && o[Oe]().matcherType === "optional") && Ee(i, r[n], t);
      var o;
    });
  }
  return Object.is(r, e10);
}, "Ee");
var Ue = /* @__PURE__ */ __name((e10) => {
  var r, t, n;
  return Xn(e10) ? jt(e10) ? (r = (t = (n = e10[Oe]()).getSelectionKeys) == null ? void 0 : t.call(n)) != null ? r : [] : Array.isArray(e10) ? Yr(e10, Ue) : Yr(Object.values(e10), Ue) : [];
}, "Ue");
var Yr = /* @__PURE__ */ __name((e10, r) => e10.reduce((t, n) => t.concat(r(n)), []), "Yr");
function ce(e10) {
  return Object.assign(e10, { optional: /* @__PURE__ */ __name(() => Cu(e10), "optional"), and: /* @__PURE__ */ __name((r) => $2(e10, r), "and"), or: /* @__PURE__ */ __name((r) => Iu(e10, r), "or"), select: /* @__PURE__ */ __name((r) => r === void 0 ? qo(e10) : qo(r, e10), "select") });
}
__name(ce, "ce");
function Cu(e10) {
  return ce({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
    let t = {}, n = /* @__PURE__ */ __name((i, o) => {
      t[i] = o;
    }, "n");
    return r === void 0 ? (Ue(e10).forEach((i) => n(i, void 0)), { matched: true, selections: t }) : { matched: Ee(e10, r, n), selections: t };
  }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Ue(e10), "getSelectionKeys"), matcherType: "optional" }) });
}
__name(Cu, "Cu");
function $2(...e10) {
  return ce({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
    let t = {}, n = /* @__PURE__ */ __name((i, o) => {
      t[i] = o;
    }, "n");
    return { matched: e10.every((i) => Ee(i, r, n)), selections: t };
  }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Yr(e10, Ue), "getSelectionKeys"), matcherType: "and" }) });
}
__name($2, "$");
function Iu(...e10) {
  return ce({ [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => {
    let t = {}, n = /* @__PURE__ */ __name((i, o) => {
      t[i] = o;
    }, "n");
    return Yr(e10, Ue).forEach((i) => n(i, void 0)), { matched: e10.some((i) => Ee(i, r, n)), selections: t };
  }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => Yr(e10, Ue), "getSelectionKeys"), matcherType: "or" }) });
}
__name(Iu, "Iu");
function A(e10) {
  return { [Oe]: () => ({ match: /* @__PURE__ */ __name((r) => ({ matched: !!e10(r) }), "match") }) };
}
__name(A, "A");
function qo(...e10) {
  let r = typeof e10[0] == "string" ? e10[0] : void 0, t = e10.length === 2 ? e10[1] : typeof e10[0] == "string" ? void 0 : e10[0];
  return ce({ [Oe]: () => ({ match: /* @__PURE__ */ __name((n) => {
    let i = { [r ?? Bt]: n };
    return { matched: t === void 0 || Ee(t, n, (o, s) => {
      i[o] = s;
    }), selections: i };
  }, "match"), getSelectionKeys: /* @__PURE__ */ __name(() => [r ?? Bt].concat(t === void 0 ? [] : Ue(t)), "getSelectionKeys") }) });
}
__name(qo, "qo");
function ye(e10) {
  return typeof e10 == "number";
}
__name(ye, "ye");
function qe(e10) {
  return typeof e10 == "string";
}
__name(qe, "qe");
function Ve(e10) {
  return typeof e10 == "bigint";
}
__name(Ve, "Ve");
var eg = ce(A(function(e10) {
  return true;
}));
var je = /* @__PURE__ */ __name((e10) => Object.assign(ce(e10), { startsWith: /* @__PURE__ */ __name((r) => {
  return je($2(e10, (t = r, A((n) => qe(n) && n.startsWith(t)))));
  var t;
}, "startsWith"), endsWith: /* @__PURE__ */ __name((r) => {
  return je($2(e10, (t = r, A((n) => qe(n) && n.endsWith(t)))));
  var t;
}, "endsWith"), minLength: /* @__PURE__ */ __name((r) => je($2(e10, ((t) => A((n) => qe(n) && n.length >= t))(r))), "minLength"), length: /* @__PURE__ */ __name((r) => je($2(e10, ((t) => A((n) => qe(n) && n.length === t))(r))), "length"), maxLength: /* @__PURE__ */ __name((r) => je($2(e10, ((t) => A((n) => qe(n) && n.length <= t))(r))), "maxLength"), includes: /* @__PURE__ */ __name((r) => {
  return je($2(e10, (t = r, A((n) => qe(n) && n.includes(t)))));
  var t;
}, "includes"), regex: /* @__PURE__ */ __name((r) => {
  return je($2(e10, (t = r, A((n) => qe(n) && !!n.match(t)))));
  var t;
}, "regex") }), "je");
var rg = je(A(qe));
var be = /* @__PURE__ */ __name((e10) => Object.assign(ce(e10), { between: /* @__PURE__ */ __name((r, t) => be($2(e10, ((n, i) => A((o) => ye(o) && n <= o && i >= o))(r, t))), "between"), lt: /* @__PURE__ */ __name((r) => be($2(e10, ((t) => A((n) => ye(n) && n < t))(r))), "lt"), gt: /* @__PURE__ */ __name((r) => be($2(e10, ((t) => A((n) => ye(n) && n > t))(r))), "gt"), lte: /* @__PURE__ */ __name((r) => be($2(e10, ((t) => A((n) => ye(n) && n <= t))(r))), "lte"), gte: /* @__PURE__ */ __name((r) => be($2(e10, ((t) => A((n) => ye(n) && n >= t))(r))), "gte"), int: /* @__PURE__ */ __name(() => be($2(e10, A((r) => ye(r) && Number.isInteger(r)))), "int"), finite: /* @__PURE__ */ __name(() => be($2(e10, A((r) => ye(r) && Number.isFinite(r)))), "finite"), positive: /* @__PURE__ */ __name(() => be($2(e10, A((r) => ye(r) && r > 0))), "positive"), negative: /* @__PURE__ */ __name(() => be($2(e10, A((r) => ye(r) && r < 0))), "negative") }), "be");
var tg = be(A(ye));
var Be = /* @__PURE__ */ __name((e10) => Object.assign(ce(e10), { between: /* @__PURE__ */ __name((r, t) => Be($2(e10, ((n, i) => A((o) => Ve(o) && n <= o && i >= o))(r, t))), "between"), lt: /* @__PURE__ */ __name((r) => Be($2(e10, ((t) => A((n) => Ve(n) && n < t))(r))), "lt"), gt: /* @__PURE__ */ __name((r) => Be($2(e10, ((t) => A((n) => Ve(n) && n > t))(r))), "gt"), lte: /* @__PURE__ */ __name((r) => Be($2(e10, ((t) => A((n) => Ve(n) && n <= t))(r))), "lte"), gte: /* @__PURE__ */ __name((r) => Be($2(e10, ((t) => A((n) => Ve(n) && n >= t))(r))), "gte"), positive: /* @__PURE__ */ __name(() => Be($2(e10, A((r) => Ve(r) && r > 0))), "positive"), negative: /* @__PURE__ */ __name(() => Be($2(e10, A((r) => Ve(r) && r < 0))), "negative") }), "Be");
var ng = Be(A(Ve));
var ig = ce(A(function(e10) {
  return typeof e10 == "boolean";
}));
var og = ce(A(function(e10) {
  return typeof e10 == "symbol";
}));
var sg = ce(A(function(e10) {
  return e10 == null;
}));
var ag = ce(A(function(e10) {
  return e10 != null;
}));
var ei = class extends Error {
  static {
    __name(this, "ei");
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
var ri = { matched: false, value: void 0 };
function yr(e10) {
  return new ti(e10, ri);
}
__name(yr, "yr");
var ti = class e {
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
    }, "a"), l = !n.some((u) => Ee(u, this.input, a)) || i && !i(this.input) ? ri : { matched: true, value: t(o ? Bt in s ? s[Bt] : s : this.input, this.input) };
    return new e(this.input, l);
  }
  when(r, t) {
    if (this.state.matched) return this;
    let n = !!r(this.input);
    return new e(this.input, n ? { matched: true, value: t(this.input, this.input) } : ri);
  }
  otherwise(r) {
    return this.state.matched ? this.state.value : r(this.input);
  }
  exhaustive() {
    if (this.state.matched) return this.state.value;
    throw new ei(this.input);
  }
  run() {
    return this.exhaustive();
  }
  returnType() {
    return this;
  }
};
var Du = { warn: Ie("prisma:warn") };
var Ou = { warn: /* @__PURE__ */ __name(() => !process2.env.PRISMA_DISABLE_WARNINGS, "warn") };
function Ut(e10, ...r) {
  Ou.warn() && console.warn(`${Du.warn} ${e10}`, ...r);
}
__name(Ut, "Ut");
var Nu = _u(ku.exec);
var z = hr("prisma:get-platform");
var Lu = ["1.0.x", "1.1.x", "3.0.x"];
async function Uo() {
  let e10 = ni.platform(), r = process2.arch;
  if (e10 === "freebsd") {
    let s = await Qt("freebsd-version");
    if (s && s.trim().length > 0) {
      let l = /^(\d+)\.?/.exec(s);
      if (l) return { platform: "freebsd", targetDistro: `freebsd${l[1]}`, arch: r };
    }
  }
  if (e10 !== "linux") return { platform: e10, arch: r };
  let t = await Mu(), n = await Qu(), i = qu({ arch: r, archFromUname: n, familyDistro: t.familyDistro }), { libssl: o } = await Vu(i);
  return { platform: "linux", libssl: o, arch: r, archFromUname: n, ...t };
}
__name(Uo, "Uo");
function Fu(e10) {
  let r = /^ID="?([^"\n]*)"?$/im, t = /^ID_LIKE="?([^"\n]*)"?$/im, n = r.exec(e10), i = n && n[1] && n[1].toLowerCase() || "", o = t.exec(e10), s = o && o[1] && o[1].toLowerCase() || "", a = yr({ id: i, idLike: s }).with({ id: "alpine" }, ({ id: l }) => ({ targetDistro: "musl", familyDistro: l, originalDistro: l })).with({ id: "raspbian" }, ({ id: l }) => ({ targetDistro: "arm", familyDistro: "debian", originalDistro: l })).with({ id: "nixos" }, ({ id: l }) => ({ targetDistro: "nixos", originalDistro: l, familyDistro: "nixos" })).with({ id: "debian" }, { id: "ubuntu" }, ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).with({ id: "rhel" }, { id: "centos" }, { id: "fedora" }, ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).when(({ idLike: l }) => l.includes("debian") || l.includes("ubuntu"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "debian", originalDistro: l })).when(({ idLike: l }) => i === "arch" || l.includes("arch"), ({ id: l }) => ({ targetDistro: "debian", familyDistro: "arch", originalDistro: l })).when(({ idLike: l }) => l.includes("centos") || l.includes("fedora") || l.includes("rhel") || l.includes("suse"), ({ id: l }) => ({ targetDistro: "rhel", familyDistro: "rhel", originalDistro: l })).otherwise(({ id: l }) => ({ targetDistro: void 0, familyDistro: void 0, originalDistro: l }));
  return z(`Found distro info:
${JSON.stringify(a, null, 2)}`), a;
}
__name(Fu, "Fu");
async function Mu() {
  let e10 = "/etc/os-release";
  try {
    let r = await Bo.readFile(e10, { encoding: "utf-8" });
    return Fu(r);
  } catch {
    return { targetDistro: void 0, familyDistro: void 0, originalDistro: void 0 };
  }
}
__name(Mu, "Mu");
function $u(e10) {
  let r = /^OpenSSL\s(\d+\.\d+)\.\d+/.exec(e10);
  if (r) {
    let t = `${r[1]}.x`;
    return Go(t);
  }
}
__name($u, "$u");
function Vo(e10) {
  let r = /libssl\.so\.(\d)(\.\d)?/.exec(e10);
  if (r) {
    let t = `${r[1]}${r[2] ?? ".0"}.x`;
    return Go(t);
  }
}
__name(Vo, "Vo");
function Go(e10) {
  let r = (() => {
    if (Wo(e10)) return e10;
    let t = e10.split(".");
    return t[1] = "0", t.join(".");
  })();
  if (Lu.includes(r)) return r;
}
__name(Go, "Go");
function qu(e10) {
  return yr(e10).with({ familyDistro: "musl" }, () => (z('Trying platform-specific paths for "alpine"'), ["/lib", "/usr/lib"])).with({ familyDistro: "debian" }, ({ archFromUname: r }) => (z('Trying platform-specific paths for "debian" (and "ubuntu")'), [`/usr/lib/${r}-linux-gnu`, `/lib/${r}-linux-gnu`])).with({ familyDistro: "rhel" }, () => (z('Trying platform-specific paths for "rhel"'), ["/lib64", "/usr/lib64"])).otherwise(({ familyDistro: r, arch: t, archFromUname: n }) => (z(`Don't know any platform-specific paths for "${r}" on ${t} (${n})`), []));
}
__name(qu, "qu");
async function Vu(e10) {
  let r = 'grep -v "libssl.so.0"', t = await jo(e10);
  if (t) {
    z(`Found libssl.so file using platform-specific paths: ${t}`);
    let o = Vo(t);
    if (z(`The parsed libssl version is: ${o}`), o) return { libssl: o, strategy: "libssl-specific-path" };
  }
  z('Falling back to "ldconfig" and other generic paths');
  let n = await Qt(`ldconfig -p | sed "s/.*=>s*//" | sed "s|.*/||" | grep libssl | sort | ${r}`);
  if (n || (n = await jo(["/lib64", "/usr/lib64", "/lib", "/usr/lib"])), n) {
    z(`Found libssl.so file using "ldconfig" or other generic paths: ${n}`);
    let o = Vo(n);
    if (z(`The parsed libssl version is: ${o}`), o) return { libssl: o, strategy: "ldconfig" };
  }
  let i = await Qt("openssl version -v");
  if (i) {
    z(`Found openssl binary with version: ${i}`);
    let o = $u(i);
    if (z(`The parsed openssl version is: ${o}`), o) return { libssl: o, strategy: "openssl-binary" };
  }
  return z("Couldn't find any version of libssl or OpenSSL in the system"), {};
}
__name(Vu, "Vu");
async function jo(e10) {
  for (let r of e10) {
    let t = await ju(r);
    if (t) return t;
  }
}
__name(jo, "jo");
async function ju(e10) {
  try {
    return (await Bo.readdir(e10)).find((t) => t.startsWith("libssl.so.") && !t.startsWith("libssl.so.0"));
  } catch (r) {
    if (r.code === "ENOENT") return;
    throw r;
  }
}
__name(ju, "ju");
async function nr() {
  let { binaryTarget: e10 } = await Qo();
  return e10;
}
__name(nr, "nr");
function Bu(e10) {
  return e10.binaryTarget !== void 0;
}
__name(Bu, "Bu");
async function ii() {
  let { memoized: e10, ...r } = await Qo();
  return r;
}
__name(ii, "ii");
var Gt = {};
async function Qo() {
  if (Bu(Gt)) return Promise.resolve({ ...Gt, memoized: true });
  let e10 = await Uo(), r = Uu(e10);
  return Gt = { ...e10, binaryTarget: r }, { ...Gt, memoized: false };
}
__name(Qo, "Qo");
function Uu(e10) {
  let { platform: r, arch: t, archFromUname: n, libssl: i, targetDistro: o, familyDistro: s, originalDistro: a } = e10;
  r === "linux" && !["x64", "arm64"].includes(t) && Ut(`Prisma only officially supports Linux on amd64 (x86_64) and arm64 (aarch64) system architectures (detected "${t}" instead). If you are using your own custom Prisma engines, you can ignore this warning, as long as you've compiled the engines for your system architecture "${n}".`);
  let l = "1.1.x";
  if (r === "linux" && i === void 0) {
    let c = yr({ familyDistro: s }).with({ familyDistro: "debian" }, () => "Please manually install OpenSSL via `apt-get update -y && apt-get install -y openssl` and try installing Prisma again. If you're running Prisma on Docker, add this command to your Dockerfile, or switch to an image that already has OpenSSL installed.").otherwise(() => "Please manually install OpenSSL and try installing Prisma again.");
    Ut(`Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-${l}".
${c}`);
  }
  let u = "debian";
  if (r === "linux" && o === void 0 && z(`Distro is "${a}". Falling back to Prisma engines built for "${u}".`), r === "darwin" && t === "arm64") return "darwin-arm64";
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
    return !i || Wo(i) ? c : `${c}-openssl-${i}`;
  }
  return r === "linux" && o && i ? `${o}-openssl-${i}` : (r !== "linux" && Ut(`Prisma detected unknown OS "${r}" and may not work as expected. Defaulting to "linux".`), i ? `${u}-openssl-${i}` : o ? `${o}-openssl-${l}` : `${u}-openssl-${l}`);
}
__name(Uu, "Uu");
async function Gu(e10) {
  try {
    return await e10();
  } catch {
    return;
  }
}
__name(Gu, "Gu");
function Qt(e10) {
  return Gu(async () => {
    let r = await Nu(e10);
    return z(`Command "${e10}" successfully returned "${r.stdout}"`), r.stdout;
  });
}
__name(Qt, "Qt");
async function Qu() {
  return typeof ni.machine == "function" ? ni.machine() : (await Qt("uname -m"))?.trim();
}
__name(Qu, "Qu");
function Wo(e10) {
  return e10.startsWith("1.");
}
__name(Wo, "Wo");
var Jt = {};
gr(Jt, { beep: /* @__PURE__ */ __name(() => yc, "beep"), clearScreen: /* @__PURE__ */ __name(() => mc, "clearScreen"), clearTerminal: /* @__PURE__ */ __name(() => fc, "clearTerminal"), cursorBackward: /* @__PURE__ */ __name(() => Zu, "cursorBackward"), cursorDown: /* @__PURE__ */ __name(() => Yu, "cursorDown"), cursorForward: /* @__PURE__ */ __name(() => zu, "cursorForward"), cursorGetPosition: /* @__PURE__ */ __name(() => rc, "cursorGetPosition"), cursorHide: /* @__PURE__ */ __name(() => ic, "cursorHide"), cursorLeft: /* @__PURE__ */ __name(() => Ho, "cursorLeft"), cursorMove: /* @__PURE__ */ __name(() => Hu, "cursorMove"), cursorNextLine: /* @__PURE__ */ __name(() => tc, "cursorNextLine"), cursorPrevLine: /* @__PURE__ */ __name(() => nc, "cursorPrevLine"), cursorRestorePosition: /* @__PURE__ */ __name(() => ec, "cursorRestorePosition"), cursorSavePosition: /* @__PURE__ */ __name(() => Xu, "cursorSavePosition"), cursorShow: /* @__PURE__ */ __name(() => oc, "cursorShow"), cursorTo: /* @__PURE__ */ __name(() => Ku, "cursorTo"), cursorUp: /* @__PURE__ */ __name(() => Ko, "cursorUp"), enterAlternativeScreen: /* @__PURE__ */ __name(() => gc, "enterAlternativeScreen"), eraseDown: /* @__PURE__ */ __name(() => uc, "eraseDown"), eraseEndLine: /* @__PURE__ */ __name(() => ac, "eraseEndLine"), eraseLine: /* @__PURE__ */ __name(() => Yo, "eraseLine"), eraseLines: /* @__PURE__ */ __name(() => sc, "eraseLines"), eraseScreen: /* @__PURE__ */ __name(() => oi, "eraseScreen"), eraseStartLine: /* @__PURE__ */ __name(() => lc, "eraseStartLine"), eraseUp: /* @__PURE__ */ __name(() => cc, "eraseUp"), exitAlternativeScreen: /* @__PURE__ */ __name(() => hc, "exitAlternativeScreen"), iTerm: /* @__PURE__ */ __name(() => wc, "iTerm"), image: /* @__PURE__ */ __name(() => Ec, "image"), link: /* @__PURE__ */ __name(() => bc, "link"), scrollDown: /* @__PURE__ */ __name(() => dc, "scrollDown"), scrollUp: /* @__PURE__ */ __name(() => pc, "scrollUp") });
var Wt = globalThis.window?.document !== void 0;
var Eg = globalThis.process?.versions?.node !== void 0;
var wg = globalThis.process?.versions?.bun !== void 0;
var xg = globalThis.Deno?.version?.deno !== void 0;
var vg = globalThis.process?.versions?.electron !== void 0;
var Pg = globalThis.navigator?.userAgent?.includes("jsdom") === true;
var Tg = typeof WorkerGlobalScope < "u" && globalThis instanceof WorkerGlobalScope;
var Sg = typeof DedicatedWorkerGlobalScope < "u" && globalThis instanceof DedicatedWorkerGlobalScope;
var Rg = typeof SharedWorkerGlobalScope < "u" && globalThis instanceof SharedWorkerGlobalScope;
var Ag = typeof ServiceWorkerGlobalScope < "u" && globalThis instanceof ServiceWorkerGlobalScope;
var zr = globalThis.navigator?.userAgentData?.platform;
var Cg = zr === "macOS" || globalThis.navigator?.platform === "MacIntel" || globalThis.navigator?.userAgent?.includes(" Mac ") === true || globalThis.process?.platform === "darwin";
var Ig = zr === "Windows" || globalThis.navigator?.platform === "Win32" || globalThis.process?.platform === "win32";
var Dg = zr === "Linux" || globalThis.navigator?.platform?.startsWith("Linux") === true || globalThis.navigator?.userAgent?.includes(" Linux ") === true || globalThis.process?.platform === "linux";
var Og = zr === "iOS" || globalThis.navigator?.platform === "MacIntel" && globalThis.navigator?.maxTouchPoints > 1 || /iPad|iPhone|iPod/.test(globalThis.navigator?.platform);
var kg = zr === "Android" || globalThis.navigator?.platform === "Android" || globalThis.navigator?.userAgent?.includes(" Android ") === true || globalThis.process?.platform === "android";
var C = "\x1B[";
var Xr = "\x1B]";
var br = "\x07";
var Zr = ";";
var Jo = !Wt && si.env.TERM_PROGRAM === "Apple_Terminal";
var Wu = !Wt && si.platform === "win32";
var Ju = Wt ? () => {
  throw new Error("`process.cwd()` only works in Node.js, not the browser.");
} : si.cwd;
var Ku = /* @__PURE__ */ __name((e10, r) => {
  if (typeof e10 != "number") throw new TypeError("The `x` argument is required");
  return typeof r != "number" ? C + (e10 + 1) + "G" : C + (r + 1) + Zr + (e10 + 1) + "H";
}, "Ku");
var Hu = /* @__PURE__ */ __name((e10, r) => {
  if (typeof e10 != "number") throw new TypeError("The `x` argument is required");
  let t = "";
  return e10 < 0 ? t += C + -e10 + "D" : e10 > 0 && (t += C + e10 + "C"), r < 0 ? t += C + -r + "A" : r > 0 && (t += C + r + "B"), t;
}, "Hu");
var Ko = /* @__PURE__ */ __name((e10 = 1) => C + e10 + "A", "Ko");
var Yu = /* @__PURE__ */ __name((e10 = 1) => C + e10 + "B", "Yu");
var zu = /* @__PURE__ */ __name((e10 = 1) => C + e10 + "C", "zu");
var Zu = /* @__PURE__ */ __name((e10 = 1) => C + e10 + "D", "Zu");
var Ho = C + "G";
var Xu = Jo ? "\x1B7" : C + "s";
var ec = Jo ? "\x1B8" : C + "u";
var rc = C + "6n";
var tc = C + "E";
var nc = C + "F";
var ic = C + "?25l";
var oc = C + "?25h";
var sc = /* @__PURE__ */ __name((e10) => {
  let r = "";
  for (let t = 0; t < e10; t++) r += Yo + (t < e10 - 1 ? Ko() : "");
  return e10 && (r += Ho), r;
}, "sc");
var ac = C + "K";
var lc = C + "1K";
var Yo = C + "2K";
var uc = C + "J";
var cc = C + "1J";
var oi = C + "2J";
var pc = C + "S";
var dc = C + "T";
var mc = "\x1Bc";
var fc = Wu ? `${oi}${C}0f` : `${oi}${C}3J${C}H`;
var gc = C + "?1049h";
var hc = C + "?1049l";
var yc = br;
var bc = /* @__PURE__ */ __name((e10, r) => [Xr, "8", Zr, Zr, r, br, e10, Xr, "8", Zr, Zr, br].join(""), "bc");
var Ec = /* @__PURE__ */ __name((e10, r = {}) => {
  let t = `${Xr}1337;File=inline=1`;
  return r.width && (t += `;width=${r.width}`), r.height && (t += `;height=${r.height}`), r.preserveAspectRatio === false && (t += ";preserveAspectRatio=0"), t + ":" + Buffer.from(e10).toString("base64") + br;
}, "Ec");
var wc = { setCwd: /* @__PURE__ */ __name((e10 = Ju()) => `${Xr}50;CurrentDir=${e10}${br}`, "setCwd"), annotation(e10, r = {}) {
  let t = `${Xr}1337;`, n = r.x !== void 0, i = r.y !== void 0;
  if ((n || i) && !(n && i && r.length !== void 0)) throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
  return e10 = e10.replaceAll("|", ""), t += r.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=", r.length > 0 ? t += (n ? [e10, r.length, r.x, r.y] : [r.length, e10]).join("|") : t += e10, t + br;
} };
var Kt = le(ns(), 1);
function ir(e10, r, { target: t = "stdout", ...n } = {}) {
  return Kt.default[t] ? Jt.link(e10, r) : n.fallback === false ? e10 : typeof n.fallback == "function" ? n.fallback(e10, r) : `${e10} (​${r}​)`;
}
__name(ir, "ir");
ir.isSupported = Kt.default.stdout;
ir.stderr = (e10, r, t = {}) => ir(e10, r, { target: "stderr", ...t });
ir.stderr.isSupported = Kt.default.stderr;
function pi(e10) {
  return ir(e10, e10, { fallback: H });
}
__name(pi, "pi");
var Sc = is();
var di = Sc.version;
function wr(e10) {
  let r = Rc();
  return r || (e10?.config.engineType === "library" ? "library" : e10?.config.engineType === "binary" ? "binary" : e10?.config.engineType === "client" ? "client" : Ac());
}
__name(wr, "wr");
function Rc() {
  let e10 = process2.env.PRISMA_CLIENT_ENGINE_TYPE;
  return e10 === "library" ? "library" : e10 === "binary" ? "binary" : e10 === "client" ? "client" : void 0;
}
__name(Rc, "Rc");
function Ac() {
  return "library";
}
__name(Ac, "Ac");
function mi(e10) {
  return e10.name === "DriverAdapterError" && typeof e10.cause == "object";
}
__name(mi, "mi");
function Ht(e10) {
  return { ok: true, value: e10, map(r) {
    return Ht(r(e10));
  }, flatMap(r) {
    return r(e10);
  } };
}
__name(Ht, "Ht");
function or(e10) {
  return { ok: false, error: e10, map() {
    return or(e10);
  }, flatMap() {
    return or(e10);
  } };
}
__name(or, "or");
var os = L("driver-adapter-utils");
var fi = class {
  static {
    __name(this, "fi");
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
var Yt = /* @__PURE__ */ __name((e10, r = new fi()) => {
  let t = { adapterName: e10.adapterName, errorRegistry: r, queryRaw: ke(r, e10.queryRaw.bind(e10)), executeRaw: ke(r, e10.executeRaw.bind(e10)), executeScript: ke(r, e10.executeScript.bind(e10)), dispose: ke(r, e10.dispose.bind(e10)), provider: e10.provider, startTransaction: /* @__PURE__ */ __name(async (...n) => (await ke(r, e10.startTransaction.bind(e10))(...n)).map((o) => Cc(r, o)), "startTransaction") };
  return e10.getConnectionInfo && (t.getConnectionInfo = Ic(r, e10.getConnectionInfo.bind(e10))), t;
}, "Yt");
var Cc = /* @__PURE__ */ __name((e10, r) => ({ adapterName: r.adapterName, provider: r.provider, options: r.options, queryRaw: ke(e10, r.queryRaw.bind(r)), executeRaw: ke(e10, r.executeRaw.bind(r)), commit: ke(e10, r.commit.bind(r)), rollback: ke(e10, r.rollback.bind(r)) }), "Cc");
function ke(e10, r) {
  return async (...t) => {
    try {
      return Ht(await r(...t));
    } catch (n) {
      if (os("[error@wrapAsync]", n), mi(n)) return or(n.cause);
      let i = e10.registerNewError(n);
      return or({ kind: "GenericJs", id: i });
    }
  };
}
__name(ke, "ke");
function Ic(e10, r) {
  return (...t) => {
    try {
      return Ht(r(...t));
    } catch (n) {
      if (os("[error@wrapSync]", n), mi(n)) return or(n.cause);
      let i = e10.registerNewError(n);
      return or({ kind: "GenericJs", id: i });
    }
  };
}
__name(Ic, "Ic");
var Oc = le(Zt());
var kc = le(Zt());
var Rh = L("prisma:engines");
function ss() {
  return M.join(__dirname, "../");
}
__name(ss, "ss");
M.join(__dirname, "../query-engine-darwin");
M.join(__dirname, "../query-engine-darwin-arm64");
M.join(__dirname, "../query-engine-debian-openssl-1.0.x");
M.join(__dirname, "../query-engine-debian-openssl-1.1.x");
M.join(__dirname, "../query-engine-debian-openssl-3.0.x");
M.join(__dirname, "../query-engine-linux-static-x64");
M.join(__dirname, "../query-engine-linux-static-arm64");
M.join(__dirname, "../query-engine-rhel-openssl-1.0.x");
M.join(__dirname, "../query-engine-rhel-openssl-1.1.x");
M.join(__dirname, "../query-engine-rhel-openssl-3.0.x");
M.join(__dirname, "../libquery_engine-darwin.dylib.node");
M.join(__dirname, "../libquery_engine-darwin-arm64.dylib.node");
M.join(__dirname, "../libquery_engine-debian-openssl-1.0.x.so.node");
M.join(__dirname, "../libquery_engine-debian-openssl-1.1.x.so.node");
M.join(__dirname, "../libquery_engine-debian-openssl-3.0.x.so.node");
M.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.0.x.so.node");
M.join(__dirname, "../libquery_engine-linux-arm64-openssl-1.1.x.so.node");
M.join(__dirname, "../libquery_engine-linux-arm64-openssl-3.0.x.so.node");
M.join(__dirname, "../libquery_engine-linux-musl.so.node");
M.join(__dirname, "../libquery_engine-linux-musl-openssl-3.0.x.so.node");
M.join(__dirname, "../libquery_engine-rhel-openssl-1.0.x.so.node");
M.join(__dirname, "../libquery_engine-rhel-openssl-1.1.x.so.node");
M.join(__dirname, "../libquery_engine-rhel-openssl-3.0.x.so.node");
M.join(__dirname, "../query_engine-windows.dll.node");
var ls = hr("chmodPlusX");
function hi(e10) {
  if (process2.platform === "win32") return;
  let r = as.statSync(e10), t = r.mode | 64 | 8 | 1;
  if (r.mode === t) {
    ls(`Execution permissions of ${e10} are fine`);
    return;
  }
  let n = t.toString(8).slice(-3);
  ls(`Have to call chmodPlusX on ${e10}`), as.chmodSync(e10, n);
}
__name(hi, "hi");
function yi(e10) {
  let r = e10.e, t = /* @__PURE__ */ __name((a) => `Prisma cannot find the required \`${a}\` system library in your system`, "t"), n = r.message.includes("cannot open shared object file"), i = `Please refer to the documentation about Prisma's system requirements: ${pi("https://pris.ly/d/system-requirements")}`, o = `Unable to require(\`${Ce(e10.id)}\`).`, s = yr({ message: r.message, code: r.code }).with({ code: "ENOENT" }, () => "File does not exist.").when(({ message: a }) => n && a.includes("libz"), () => `${t("libz")}. Please install it and try again.`).when(({ message: a }) => n && a.includes("libgcc_s"), () => `${t("libgcc_s")}. Please install it and try again.`).when(({ message: a }) => n && a.includes("libssl"), () => {
    let a = e10.platformInfo.libssl ? `openssl-${e10.platformInfo.libssl}` : "openssl";
    return `${t("libssl")}. Please install ${a} and try again.`;
  }).when(({ message: a }) => a.includes("GLIBC"), () => `Prisma has detected an incompatible version of the \`glibc\` C standard library installed in your system. This probably means your system may be too old to run Prisma. ${i}`).when(({ message: a }) => e10.platformInfo.platform === "linux" && a.includes("symbol not found"), () => `The Prisma engines are not compatible with your system ${e10.platformInfo.originalDistro} on (${e10.platformInfo.archFromUname}) which uses the \`${e10.platformInfo.binaryTarget}\` binaryTarget by default. ${i}`).otherwise(() => `The Prisma engines do not seem to be compatible with your system. ${i}`);
  return `${o}
${s}

Details: ${r.message}`;
}
__name(yi, "yi");
var ps = le(cs(), 1);
function bi(e10) {
  let r = (0, ps.default)(e10);
  if (r === 0) return e10;
  let t = new RegExp(`^[ \\t]{${r}}`, "gm");
  return e10.replace(t, "");
}
__name(bi, "bi");
var ds = "prisma+postgres";
var Xt = `${ds}:`;
function en(e10) {
  return e10?.toString().startsWith(`${Xt}//`) ?? false;
}
__name(en, "en");
function Ei(e10) {
  if (!en(e10)) return false;
  let { host: r } = new URL(e10);
  return r.includes("localhost") || r.includes("127.0.0.1") || r.includes("[::1]");
}
__name(Ei, "Ei");
var fs = le(wi());
function vi(e10) {
  return String(new xi(e10));
}
__name(vi, "vi");
var xi = class {
  static {
    __name(this, "xi");
  }
  constructor(r) {
    this.config = r;
  }
  toString() {
    let { config: r } = this, t = r.provider.fromEnvVar ? `env("${r.provider.fromEnvVar}")` : r.provider.value, n = JSON.parse(JSON.stringify({ provider: t, binaryTargets: _c(r.binaryTargets) }));
    return `generator ${r.name} {
${(0, fs.default)(Nc(n), 2)}
}`;
  }
};
function _c(e10) {
  let r;
  if (e10.length > 0) {
    let t = e10.find((n) => n.fromEnvVar !== null);
    t ? r = `env("${t.fromEnvVar}")` : r = e10.map((n) => n.native ? "native" : n.value);
  } else r = void 0;
  return r;
}
__name(_c, "_c");
function Nc(e10) {
  let r = Object.keys(e10).reduce((t, n) => Math.max(t, n.length), 0);
  return Object.entries(e10).map(([t, n]) => `${t.padEnd(r)} = ${Lc(n)}`).join(`
`);
}
__name(Nc, "Nc");
function Lc(e10) {
  return JSON.parse(JSON.stringify(e10, (r, t) => Array.isArray(t) ? `[${t.map((n) => JSON.stringify(n)).join(", ")}]` : JSON.stringify(t)));
}
__name(Lc, "Lc");
var rt = {};
gr(rt, { error: /* @__PURE__ */ __name(() => $c, "error"), info: /* @__PURE__ */ __name(() => Mc, "info"), log: /* @__PURE__ */ __name(() => Fc, "log"), query: /* @__PURE__ */ __name(() => qc, "query"), should: /* @__PURE__ */ __name(() => gs, "should"), tags: /* @__PURE__ */ __name(() => et, "tags"), warn: /* @__PURE__ */ __name(() => Pi, "warn") });
var et = { error: ue("prisma:error"), warn: Ie("prisma:warn"), info: De("prisma:info"), query: tr("prisma:query") };
var gs = { warn: /* @__PURE__ */ __name(() => !process2.env.PRISMA_DISABLE_WARNINGS, "warn") };
function Fc(...e10) {
  console.log(...e10);
}
__name(Fc, "Fc");
function Pi(e10, ...r) {
  gs.warn() && console.warn(`${et.warn} ${e10}`, ...r);
}
__name(Pi, "Pi");
function Mc(e10, ...r) {
  console.info(`${et.info} ${e10}`, ...r);
}
__name(Mc, "Mc");
function $c(e10, ...r) {
  console.error(`${et.error} ${e10}`, ...r);
}
__name($c, "$c");
function qc(e10, ...r) {
  console.log(`${et.query} ${e10}`, ...r);
}
__name(qc, "qc");
function rn(e10, r) {
  if (!e10) throw new Error(`${r}. This should never happen. If you see this error, please, open an issue at https://pris.ly/prisma-prisma-bug-report`);
}
__name(rn, "rn");
function sr(e10, r) {
  throw new Error(r);
}
__name(sr, "sr");
function Ti({ onlyFirst: e10 = false } = {}) {
  let t = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(t, e10 ? void 0 : "g");
}
__name(Ti, "Ti");
var Vc = Ti();
function xr(e10) {
  if (typeof e10 != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e10}\``);
  return e10.replace(Vc, "");
}
__name(xr, "xr");
function Si(e10) {
  return tn.sep === tn.posix.sep ? e10 : e10.split(tn.sep).join(tn.posix.sep);
}
__name(Si, "Si");
var Di = le(xs());
function vs(e10) {
  let r = e10.ignoreProcessEnv ? {} : process2.env, t = /* @__PURE__ */ __name((n) => n.match(/(.?\${(?:[a-zA-Z0-9_]+)?})/g)?.reduce(function(o, s) {
    let a = /(.?)\${([a-zA-Z0-9_]+)?}/g.exec(s);
    if (!a) return o;
    let l = a[1], u, c;
    if (l === "\\") c = a[0], u = c.replace("\\$", "$");
    else {
      let p = a[2];
      c = a[0].substring(l.length), u = Object.hasOwnProperty.call(r, p) ? r[p] : e10.parsed[p] || "", u = t(u);
    }
    return o.replace(c, u);
  }, n) ?? n, "t");
  for (let n in e10.parsed) {
    let i = Object.hasOwnProperty.call(r, n) ? r[n] : e10.parsed[n];
    e10.parsed[n] = t(i);
  }
  for (let n in e10.parsed) r[n] = e10.parsed[n];
  return e10;
}
__name(vs, "vs");
var Ii = hr("prisma:tryLoadEnv");
function it({ rootEnvPath: e10, schemaEnvPath: r }, t = { conflictCheck: "none" }) {
  let n = Ps(e10);
  t.conflictCheck !== "none" && rp(n, r, t.conflictCheck);
  let i = null;
  return Ts(n?.path, r) || (i = Ps(r)), !n && !i && Ii("No Environment variables loaded"), i?.dotenvResult.error ? console.error(ue(Q("Schema Env Error: ")) + i.dotenvResult.error) : { message: [n?.message, i?.message].filter(Boolean).join(`
`), parsed: { ...n?.dotenvResult?.parsed, ...i?.dotenvResult?.parsed } };
}
__name(it, "it");
function rp(e10, r, t) {
  let n = e10?.dotenvResult.parsed, i = !Ts(e10?.path, r);
  if (n && r && i && Ci.existsSync(r)) {
    let o = Di.default.parse(Ci.readFileSync(r)), s = [];
    for (let a in o) n[a] === o[a] && s.push(a);
    if (s.length > 0) {
      let a = nt.relative(process2.cwd(), e10.path), l = nt.relative(process2.cwd(), r);
      if (t === "error") {
        let u = `There is a conflict between env var${s.length > 1 ? "s" : ""} in ${H(a)} and ${H(l)}
Conflicting env vars:
${s.map((c) => `  ${Q(c)}`).join(`
`)}

We suggest to move the contents of ${H(l)} to ${H(a)} to consolidate your env vars.
`;
        throw new Error(u);
      } else if (t === "warn") {
        let u = `Conflict for env var${s.length > 1 ? "s" : ""} ${s.map((c) => Q(c)).join(", ")} in ${H(a)} and ${H(l)}
Env vars from ${H(l)} overwrite the ones from ${H(a)}
      `;
        console.warn(`${Ie("warn(prisma)")} ${u}`);
      }
    }
  }
}
__name(rp, "rp");
function Ps(e10) {
  if (tp(e10)) {
    Ii(`Environment variables loaded from ${e10}`);
    let r = Di.default.config({ path: e10, debug: process2.env.DOTENV_CONFIG_DEBUG ? true : void 0 });
    return { dotenvResult: vs(r), message: Ce(`Environment variables loaded from ${nt.relative(process2.cwd(), e10)}`), path: e10 };
  } else Ii(`Environment variables not found at ${e10}`);
  return null;
}
__name(Ps, "Ps");
function Ts(e10, r) {
  return e10 && r && nt.resolve(e10) === nt.resolve(r);
}
__name(Ts, "Ts");
function tp(e10) {
  return !!(e10 && Ci.existsSync(e10));
}
__name(tp, "tp");
function Oi(e10, r) {
  return Object.prototype.hasOwnProperty.call(e10, r);
}
__name(Oi, "Oi");
function on(e10, r) {
  let t = {};
  for (let n of Object.keys(e10)) t[n] = r(e10[n], n);
  return t;
}
__name(on, "on");
function ki(e10, r) {
  if (e10.length === 0) return;
  let t = e10[0];
  for (let n = 1; n < e10.length; n++) r(t, e10[n]) < 0 && (t = e10[n]);
  return t;
}
__name(ki, "ki");
function x(e10, r) {
  Object.defineProperty(e10, "name", { value: r, configurable: true });
}
__name(x, "x");
var Rs = /* @__PURE__ */ new Set();
var sn = /* @__PURE__ */ __name((e10, r, ...t) => {
  Rs.has(e10) || (Rs.add(e10), Pi(r, ...t));
}, "sn");
var P = class e2 extends Error {
  static {
    __name(this, "e");
  }
  clientVersion;
  errorCode;
  retryable;
  constructor(r, t, n) {
    super(r), this.name = "PrismaClientInitializationError", this.clientVersion = t, this.errorCode = n, Error.captureStackTrace(e2);
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientInitializationError";
  }
};
x(P, "PrismaClientInitializationError");
var Z = class extends Error {
  static {
    __name(this, "Z");
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
x(Z, "PrismaClientKnownRequestError");
var de = class extends Error {
  static {
    __name(this, "de");
  }
  clientVersion;
  constructor(r, t) {
    super(r), this.name = "PrismaClientRustPanicError", this.clientVersion = t;
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientRustPanicError";
  }
};
x(de, "PrismaClientRustPanicError");
var q = class extends Error {
  static {
    __name(this, "q");
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
x(q, "PrismaClientUnknownRequestError");
var X = class extends Error {
  static {
    __name(this, "X");
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
x(X, "PrismaClientValidationError");
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
function Qe(e10) {
  return e10.substring(0, 1).toLowerCase() + e10.substring(1);
}
__name(Qe, "Qe");
function As(e10, r) {
  let t = {};
  for (let n of e10) {
    let i = n[r];
    t[i] = n;
  }
  return t;
}
__name(As, "As");
function ot(e10) {
  let r;
  return { get() {
    return r || (r = { value: e10() }), r.value;
  } };
}
__name(ot, "ot");
function vr(e10) {
  return e10 instanceof Date || Object.prototype.toString.call(e10) === "[object Date]";
}
__name(vr, "vr");
function ln(e10) {
  return e10.toString() !== "Invalid Date";
}
__name(ln, "ln");
var Pr = 9e15;
var He = 1e9;
var Ni = "0123456789abcdef";
var pn = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
var dn = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
var Li = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -Pr, maxE: Pr, crypto: false };
var Os;
var Ne;
var w = true;
var fn = "[DecimalError] ";
var Ke = fn + "Invalid argument: ";
var ks = fn + "Precision limit exceeded";
var _s = fn + "crypto unavailable";
var Ns = "[object Decimal]";
var Y = Math.floor;
var B = Math.pow;
var ip = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
var op = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
var sp = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
var Ls = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
var fe = 1e7;
var E = 7;
var ap = 9007199254740991;
var lp = pn.length - 1;
var Fi = dn.length - 1;
var m = { toStringTag: Ns };
m.absoluteValue = m.abs = function() {
  var e10 = new this.constructor(this);
  return e10.s < 0 && (e10.s = 1), y(e10);
};
m.ceil = function() {
  return y(new this.constructor(this), this.e + 1, 2);
};
m.clampedTo = m.clamp = function(e10, r) {
  var t, n = this, i = n.constructor;
  if (e10 = new i(e10), r = new i(r), !e10.s || !r.s) return new i(NaN);
  if (e10.gt(r)) throw Error(Ke + r);
  return t = n.cmp(e10), t < 0 ? e10 : n.cmp(r) > 0 ? r : new i(n);
};
m.comparedTo = m.cmp = function(e10) {
  var r, t, n, i, o = this, s = o.d, a = (e10 = new o.constructor(e10)).d, l = o.s, u = e10.s;
  if (!s || !a) return !l || !u ? NaN : l !== u ? l : s === a ? 0 : !s ^ l < 0 ? 1 : -1;
  if (!s[0] || !a[0]) return s[0] ? l : a[0] ? -u : 0;
  if (l !== u) return l;
  if (o.e !== e10.e) return o.e > e10.e ^ l < 0 ? 1 : -1;
  for (n = s.length, i = a.length, r = 0, t = n < i ? n : i; r < t; ++r) if (s[r] !== a[r]) return s[r] > a[r] ^ l < 0 ? 1 : -1;
  return n === i ? 0 : n > i ^ l < 0 ? 1 : -1;
};
m.cosine = m.cos = function() {
  var e10, r, t = this, n = t.constructor;
  return t.d ? t.d[0] ? (e10 = n.precision, r = n.rounding, n.precision = e10 + Math.max(t.e, t.sd()) + E, n.rounding = 1, t = up(n, Vs(n, t)), n.precision = e10, n.rounding = r, y(Ne == 2 || Ne == 3 ? t.neg() : t, e10, r, true)) : new n(1) : new n(NaN);
};
m.cubeRoot = m.cbrt = function() {
  var e10, r, t, n, i, o, s, a, l, u, c = this, p = c.constructor;
  if (!c.isFinite() || c.isZero()) return new p(c);
  for (w = false, o = c.s * B(c.s * c, 1 / 3), !o || Math.abs(o) == 1 / 0 ? (t = W(c.d), e10 = c.e, (o = (e10 - t.length + 1) % 3) && (t += o == 1 || o == -2 ? "0" : "00"), o = B(t, 1 / 3), e10 = Y((e10 + 1) / 3) - (e10 % 3 == (e10 < 0 ? -1 : 2)), o == 1 / 0 ? t = "5e" + e10 : (t = o.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e10), n = new p(t), n.s = c.s) : n = new p(o.toString()), s = (e10 = p.precision) + 3; ; ) if (a = n, l = a.times(a).times(a), u = l.plus(c), n = _(u.plus(c).times(a), u.plus(l), s + 2, 1), W(a.d).slice(0, s) === (t = W(n.d)).slice(0, s)) if (t = t.slice(s - 3, s + 1), t == "9999" || !i && t == "4999") {
    if (!i && (y(a, e10 + 1, 0), a.times(a).times(a).eq(c))) {
      n = a;
      break;
    }
    s += 4, i = 1;
  } else {
    (!+t || !+t.slice(1) && t.charAt(0) == "5") && (y(n, e10 + 1, 1), r = !n.times(n).times(n).eq(c));
    break;
  }
  return w = true, y(n, e10, p.rounding, r);
};
m.decimalPlaces = m.dp = function() {
  var e10, r = this.d, t = NaN;
  if (r) {
    if (e10 = r.length - 1, t = (e10 - Y(this.e / E)) * E, e10 = r[e10], e10) for (; e10 % 10 == 0; e10 /= 10) t--;
    t < 0 && (t = 0);
  }
  return t;
};
m.dividedBy = m.div = function(e10) {
  return _(this, new this.constructor(e10));
};
m.dividedToIntegerBy = m.divToInt = function(e10) {
  var r = this, t = r.constructor;
  return y(_(r, new t(e10), 0, 1, 1), t.precision, t.rounding);
};
m.equals = m.eq = function(e10) {
  return this.cmp(e10) === 0;
};
m.floor = function() {
  return y(new this.constructor(this), this.e + 1, 3);
};
m.greaterThan = m.gt = function(e10) {
  return this.cmp(e10) > 0;
};
m.greaterThanOrEqualTo = m.gte = function(e10) {
  var r = this.cmp(e10);
  return r == 1 || r === 0;
};
m.hyperbolicCosine = m.cosh = function() {
  var e10, r, t, n, i, o = this, s = o.constructor, a = new s(1);
  if (!o.isFinite()) return new s(o.s ? 1 / 0 : NaN);
  if (o.isZero()) return a;
  t = s.precision, n = s.rounding, s.precision = t + Math.max(o.e, o.sd()) + 4, s.rounding = 1, i = o.d.length, i < 32 ? (e10 = Math.ceil(i / 3), r = (1 / hn(4, e10)).toString()) : (e10 = 16, r = "2.3283064365386962890625e-10"), o = Tr(s, 1, o.times(r), new s(1), true);
  for (var l, u = e10, c = new s(8); u--; ) l = o.times(o), o = a.minus(l.times(c.minus(l.times(c))));
  return y(o, s.precision = t, s.rounding = n, true);
};
m.hyperbolicSine = m.sinh = function() {
  var e10, r, t, n, i = this, o = i.constructor;
  if (!i.isFinite() || i.isZero()) return new o(i);
  if (r = o.precision, t = o.rounding, o.precision = r + Math.max(i.e, i.sd()) + 4, o.rounding = 1, n = i.d.length, n < 3) i = Tr(o, 2, i, i, true);
  else {
    e10 = 1.4 * Math.sqrt(n), e10 = e10 > 16 ? 16 : e10 | 0, i = i.times(1 / hn(5, e10)), i = Tr(o, 2, i, i, true);
    for (var s, a = new o(5), l = new o(16), u = new o(20); e10--; ) s = i.times(i), i = i.times(a.plus(s.times(l.times(s).plus(u))));
  }
  return o.precision = r, o.rounding = t, y(i, r, t, true);
};
m.hyperbolicTangent = m.tanh = function() {
  var e10, r, t = this, n = t.constructor;
  return t.isFinite() ? t.isZero() ? new n(t) : (e10 = n.precision, r = n.rounding, n.precision = e10 + 7, n.rounding = 1, _(t.sinh(), t.cosh(), n.precision = e10, n.rounding = r)) : new n(t.s);
};
m.inverseCosine = m.acos = function() {
  var e10 = this, r = e10.constructor, t = e10.abs().cmp(1), n = r.precision, i = r.rounding;
  return t !== -1 ? t === 0 ? e10.isNeg() ? xe(r, n, i) : new r(0) : new r(NaN) : e10.isZero() ? xe(r, n + 4, i).times(0.5) : (r.precision = n + 6, r.rounding = 1, e10 = new r(1).minus(e10).div(e10.plus(1)).sqrt().atan(), r.precision = n, r.rounding = i, e10.times(2));
};
m.inverseHyperbolicCosine = m.acosh = function() {
  var e10, r, t = this, n = t.constructor;
  return t.lte(1) ? new n(t.eq(1) ? 0 : NaN) : t.isFinite() ? (e10 = n.precision, r = n.rounding, n.precision = e10 + Math.max(Math.abs(t.e), t.sd()) + 4, n.rounding = 1, w = false, t = t.times(t).minus(1).sqrt().plus(t), w = true, n.precision = e10, n.rounding = r, t.ln()) : new n(t);
};
m.inverseHyperbolicSine = m.asinh = function() {
  var e10, r, t = this, n = t.constructor;
  return !t.isFinite() || t.isZero() ? new n(t) : (e10 = n.precision, r = n.rounding, n.precision = e10 + 2 * Math.max(Math.abs(t.e), t.sd()) + 6, n.rounding = 1, w = false, t = t.times(t).plus(1).sqrt().plus(t), w = true, n.precision = e10, n.rounding = r, t.ln());
};
m.inverseHyperbolicTangent = m.atanh = function() {
  var e10, r, t, n, i = this, o = i.constructor;
  return i.isFinite() ? i.e >= 0 ? new o(i.abs().eq(1) ? i.s / 0 : i.isZero() ? i : NaN) : (e10 = o.precision, r = o.rounding, n = i.sd(), Math.max(n, e10) < 2 * -i.e - 1 ? y(new o(i), e10, r, true) : (o.precision = t = n - i.e, i = _(i.plus(1), new o(1).minus(i), t + e10, 1), o.precision = e10 + 4, o.rounding = 1, i = i.ln(), o.precision = e10, o.rounding = r, i.times(0.5))) : new o(NaN);
};
m.inverseSine = m.asin = function() {
  var e10, r, t, n, i = this, o = i.constructor;
  return i.isZero() ? new o(i) : (r = i.abs().cmp(1), t = o.precision, n = o.rounding, r !== -1 ? r === 0 ? (e10 = xe(o, t + 4, n).times(0.5), e10.s = i.s, e10) : new o(NaN) : (o.precision = t + 6, o.rounding = 1, i = i.div(new o(1).minus(i.times(i)).sqrt().plus(1)).atan(), o.precision = t, o.rounding = n, i.times(2)));
};
m.inverseTangent = m.atan = function() {
  var e10, r, t, n, i, o, s, a, l, u = this, c = u.constructor, p = c.precision, d = c.rounding;
  if (u.isFinite()) {
    if (u.isZero()) return new c(u);
    if (u.abs().eq(1) && p + 4 <= Fi) return s = xe(c, p + 4, d).times(0.25), s.s = u.s, s;
  } else {
    if (!u.s) return new c(NaN);
    if (p + 4 <= Fi) return s = xe(c, p + 4, d).times(0.5), s.s = u.s, s;
  }
  for (c.precision = a = p + 10, c.rounding = 1, t = Math.min(28, a / E + 2 | 0), e10 = t; e10; --e10) u = u.div(u.times(u).plus(1).sqrt().plus(1));
  for (w = false, r = Math.ceil(a / E), n = 1, l = u.times(u), s = new c(u), i = u; e10 !== -1; ) if (i = i.times(l), o = s.minus(i.div(n += 2)), i = i.times(l), s = o.plus(i.div(n += 2)), s.d[r] !== void 0) for (e10 = r; s.d[e10] === o.d[e10] && e10--; ) ;
  return t && (s = s.times(2 << t - 1)), w = true, y(s, c.precision = p, c.rounding = d, true);
};
m.isFinite = function() {
  return !!this.d;
};
m.isInteger = m.isInt = function() {
  return !!this.d && Y(this.e / E) > this.d.length - 2;
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
m.lessThan = m.lt = function(e10) {
  return this.cmp(e10) < 0;
};
m.lessThanOrEqualTo = m.lte = function(e10) {
  return this.cmp(e10) < 1;
};
m.logarithm = m.log = function(e10) {
  var r, t, n, i, o, s, a, l, u = this, c = u.constructor, p = c.precision, d = c.rounding, f = 5;
  if (e10 == null) e10 = new c(10), r = true;
  else {
    if (e10 = new c(e10), t = e10.d, e10.s < 0 || !t || !t[0] || e10.eq(1)) return new c(NaN);
    r = e10.eq(10);
  }
  if (t = u.d, u.s < 0 || !t || !t[0] || u.eq(1)) return new c(t && !t[0] ? -1 / 0 : u.s != 1 ? NaN : t ? 0 : 1 / 0);
  if (r) if (t.length > 1) o = true;
  else {
    for (i = t[0]; i % 10 === 0; ) i /= 10;
    o = i !== 1;
  }
  if (w = false, a = p + f, s = Je(u, a), n = r ? mn(c, a + 10) : Je(e10, a), l = _(s, n, a, 1), st(l.d, i = p, d)) do
    if (a += 10, s = Je(u, a), n = r ? mn(c, a + 10) : Je(e10, a), l = _(s, n, a, 1), !o) {
      +W(l.d).slice(i + 1, i + 15) + 1 == 1e14 && (l = y(l, p + 1, 0));
      break;
    }
  while (st(l.d, i += 10, d));
  return w = true, y(l, p, d);
};
m.minus = m.sub = function(e10) {
  var r, t, n, i, o, s, a, l, u, c, p, d, f = this, h = f.constructor;
  if (e10 = new h(e10), !f.d || !e10.d) return !f.s || !e10.s ? e10 = new h(NaN) : f.d ? e10.s = -e10.s : e10 = new h(e10.d || f.s !== e10.s ? f : NaN), e10;
  if (f.s != e10.s) return e10.s = -e10.s, f.plus(e10);
  if (u = f.d, d = e10.d, a = h.precision, l = h.rounding, !u[0] || !d[0]) {
    if (d[0]) e10.s = -e10.s;
    else if (u[0]) e10 = new h(f);
    else return new h(l === 3 ? -0 : 0);
    return w ? y(e10, a, l) : e10;
  }
  if (t = Y(e10.e / E), c = Y(f.e / E), u = u.slice(), o = c - t, o) {
    for (p = o < 0, p ? (r = u, o = -o, s = d.length) : (r = d, t = c, s = u.length), n = Math.max(Math.ceil(a / E), s) + 2, o > n && (o = n, r.length = 1), r.reverse(), n = o; n--; ) r.push(0);
    r.reverse();
  } else {
    for (n = u.length, s = d.length, p = n < s, p && (s = n), n = 0; n < s; n++) if (u[n] != d[n]) {
      p = u[n] < d[n];
      break;
    }
    o = 0;
  }
  for (p && (r = u, u = d, d = r, e10.s = -e10.s), s = u.length, n = d.length - s; n > 0; --n) u[s++] = 0;
  for (n = d.length; n > o; ) {
    if (u[--n] < d[n]) {
      for (i = n; i && u[--i] === 0; ) u[i] = fe - 1;
      --u[i], u[n] += fe;
    }
    u[n] -= d[n];
  }
  for (; u[--s] === 0; ) u.pop();
  for (; u[0] === 0; u.shift()) --t;
  return u[0] ? (e10.d = u, e10.e = gn(u, t), w ? y(e10, a, l) : e10) : new h(l === 3 ? -0 : 0);
};
m.modulo = m.mod = function(e10) {
  var r, t = this, n = t.constructor;
  return e10 = new n(e10), !t.d || !e10.s || e10.d && !e10.d[0] ? new n(NaN) : !e10.d || t.d && !t.d[0] ? y(new n(t), n.precision, n.rounding) : (w = false, n.modulo == 9 ? (r = _(t, e10.abs(), 0, 3, 1), r.s *= e10.s) : r = _(t, e10, 0, n.modulo, 1), r = r.times(e10), w = true, t.minus(r));
};
m.naturalExponential = m.exp = function() {
  return Mi(this);
};
m.naturalLogarithm = m.ln = function() {
  return Je(this);
};
m.negated = m.neg = function() {
  var e10 = new this.constructor(this);
  return e10.s = -e10.s, y(e10);
};
m.plus = m.add = function(e10) {
  var r, t, n, i, o, s, a, l, u, c, p = this, d = p.constructor;
  if (e10 = new d(e10), !p.d || !e10.d) return !p.s || !e10.s ? e10 = new d(NaN) : p.d || (e10 = new d(e10.d || p.s === e10.s ? p : NaN)), e10;
  if (p.s != e10.s) return e10.s = -e10.s, p.minus(e10);
  if (u = p.d, c = e10.d, a = d.precision, l = d.rounding, !u[0] || !c[0]) return c[0] || (e10 = new d(p)), w ? y(e10, a, l) : e10;
  if (o = Y(p.e / E), n = Y(e10.e / E), u = u.slice(), i = o - n, i) {
    for (i < 0 ? (t = u, i = -i, s = c.length) : (t = c, n = o, s = u.length), o = Math.ceil(a / E), s = o > s ? o + 1 : s + 1, i > s && (i = s, t.length = 1), t.reverse(); i--; ) t.push(0);
    t.reverse();
  }
  for (s = u.length, i = c.length, s - i < 0 && (i = s, t = c, c = u, u = t), r = 0; i; ) r = (u[--i] = u[i] + c[i] + r) / fe | 0, u[i] %= fe;
  for (r && (u.unshift(r), ++n), s = u.length; u[--s] == 0; ) u.pop();
  return e10.d = u, e10.e = gn(u, n), w ? y(e10, a, l) : e10;
};
m.precision = m.sd = function(e10) {
  var r, t = this;
  if (e10 !== void 0 && e10 !== !!e10 && e10 !== 1 && e10 !== 0) throw Error(Ke + e10);
  return t.d ? (r = Fs(t.d), e10 && t.e + 1 > r && (r = t.e + 1)) : r = NaN, r;
};
m.round = function() {
  var e10 = this, r = e10.constructor;
  return y(new r(e10), e10.e + 1, r.rounding);
};
m.sine = m.sin = function() {
  var e10, r, t = this, n = t.constructor;
  return t.isFinite() ? t.isZero() ? new n(t) : (e10 = n.precision, r = n.rounding, n.precision = e10 + Math.max(t.e, t.sd()) + E, n.rounding = 1, t = pp(n, Vs(n, t)), n.precision = e10, n.rounding = r, y(Ne > 2 ? t.neg() : t, e10, r, true)) : new n(NaN);
};
m.squareRoot = m.sqrt = function() {
  var e10, r, t, n, i, o, s = this, a = s.d, l = s.e, u = s.s, c = s.constructor;
  if (u !== 1 || !a || !a[0]) return new c(!u || u < 0 && (!a || a[0]) ? NaN : a ? s : 1 / 0);
  for (w = false, u = Math.sqrt(+s), u == 0 || u == 1 / 0 ? (r = W(a), (r.length + l) % 2 == 0 && (r += "0"), u = Math.sqrt(r), l = Y((l + 1) / 2) - (l < 0 || l % 2), u == 1 / 0 ? r = "5e" + l : (r = u.toExponential(), r = r.slice(0, r.indexOf("e") + 1) + l), n = new c(r)) : n = new c(u.toString()), t = (l = c.precision) + 3; ; ) if (o = n, n = o.plus(_(s, o, t + 2, 1)).times(0.5), W(o.d).slice(0, t) === (r = W(n.d)).slice(0, t)) if (r = r.slice(t - 3, t + 1), r == "9999" || !i && r == "4999") {
    if (!i && (y(o, l + 1, 0), o.times(o).eq(s))) {
      n = o;
      break;
    }
    t += 4, i = 1;
  } else {
    (!+r || !+r.slice(1) && r.charAt(0) == "5") && (y(n, l + 1, 1), e10 = !n.times(n).eq(s));
    break;
  }
  return w = true, y(n, l, c.rounding, e10);
};
m.tangent = m.tan = function() {
  var e10, r, t = this, n = t.constructor;
  return t.isFinite() ? t.isZero() ? new n(t) : (e10 = n.precision, r = n.rounding, n.precision = e10 + 10, n.rounding = 1, t = t.sin(), t.s = 1, t = _(t, new n(1).minus(t.times(t)).sqrt(), e10 + 10, 0), n.precision = e10, n.rounding = r, y(Ne == 2 || Ne == 4 ? t.neg() : t, e10, r, true)) : new n(NaN);
};
m.times = m.mul = function(e10) {
  var r, t, n, i, o, s, a, l, u, c = this, p = c.constructor, d = c.d, f = (e10 = new p(e10)).d;
  if (e10.s *= c.s, !d || !d[0] || !f || !f[0]) return new p(!e10.s || d && !d[0] && !f || f && !f[0] && !d ? NaN : !d || !f ? e10.s / 0 : e10.s * 0);
  for (t = Y(c.e / E) + Y(e10.e / E), l = d.length, u = f.length, l < u && (o = d, d = f, f = o, s = l, l = u, u = s), o = [], s = l + u, n = s; n--; ) o.push(0);
  for (n = u; --n >= 0; ) {
    for (r = 0, i = l + n; i > n; ) a = o[i] + f[n] * d[i - n - 1] + r, o[i--] = a % fe | 0, r = a / fe | 0;
    o[i] = (o[i] + r) % fe | 0;
  }
  for (; !o[--s]; ) o.pop();
  return r ? ++t : o.shift(), e10.d = o, e10.e = gn(o, t), w ? y(e10, p.precision, p.rounding) : e10;
};
m.toBinary = function(e10, r) {
  return $i(this, 2, e10, r);
};
m.toDecimalPlaces = m.toDP = function(e10, r) {
  var t = this, n = t.constructor;
  return t = new n(t), e10 === void 0 ? t : (te(e10, 0, He), r === void 0 ? r = n.rounding : te(r, 0, 8), y(t, e10 + t.e + 1, r));
};
m.toExponential = function(e10, r) {
  var t, n = this, i = n.constructor;
  return e10 === void 0 ? t = ve(n, true) : (te(e10, 0, He), r === void 0 ? r = i.rounding : te(r, 0, 8), n = y(new i(n), e10 + 1, r), t = ve(n, true, e10 + 1)), n.isNeg() && !n.isZero() ? "-" + t : t;
};
m.toFixed = function(e10, r) {
  var t, n, i = this, o = i.constructor;
  return e10 === void 0 ? t = ve(i) : (te(e10, 0, He), r === void 0 ? r = o.rounding : te(r, 0, 8), n = y(new o(i), e10 + i.e + 1, r), t = ve(n, false, e10 + n.e + 1)), i.isNeg() && !i.isZero() ? "-" + t : t;
};
m.toFraction = function(e10) {
  var r, t, n, i, o, s, a, l, u, c, p, d, f = this, h = f.d, g = f.constructor;
  if (!h) return new g(f);
  if (u = t = new g(1), n = l = new g(0), r = new g(n), o = r.e = Fs(h) - f.e - 1, s = o % E, r.d[0] = B(10, s < 0 ? E + s : s), e10 == null) e10 = o > 0 ? r : u;
  else {
    if (a = new g(e10), !a.isInt() || a.lt(u)) throw Error(Ke + a);
    e10 = a.gt(r) ? o > 0 ? r : u : a;
  }
  for (w = false, a = new g(W(h)), c = g.precision, g.precision = o = h.length * E * 2; p = _(a, r, 0, 1, 1), i = t.plus(p.times(n)), i.cmp(e10) != 1; ) t = n, n = i, i = u, u = l.plus(p.times(i)), l = i, i = r, r = a.minus(p.times(i)), a = i;
  return i = _(e10.minus(t), n, 0, 1, 1), l = l.plus(i.times(u)), t = t.plus(i.times(n)), l.s = u.s = f.s, d = _(u, n, o, 1).minus(f).abs().cmp(_(l, t, o, 1).minus(f).abs()) < 1 ? [u, n] : [l, t], g.precision = c, w = true, d;
};
m.toHexadecimal = m.toHex = function(e10, r) {
  return $i(this, 16, e10, r);
};
m.toNearest = function(e10, r) {
  var t = this, n = t.constructor;
  if (t = new n(t), e10 == null) {
    if (!t.d) return t;
    e10 = new n(1), r = n.rounding;
  } else {
    if (e10 = new n(e10), r === void 0 ? r = n.rounding : te(r, 0, 8), !t.d) return e10.s ? t : e10;
    if (!e10.d) return e10.s && (e10.s = t.s), e10;
  }
  return e10.d[0] ? (w = false, t = _(t, e10, 0, r, 1).times(e10), w = true, y(t)) : (e10.s = t.s, t = e10), t;
};
m.toNumber = function() {
  return +this;
};
m.toOctal = function(e10, r) {
  return $i(this, 8, e10, r);
};
m.toPower = m.pow = function(e10) {
  var r, t, n, i, o, s, a = this, l = a.constructor, u = +(e10 = new l(e10));
  if (!a.d || !e10.d || !a.d[0] || !e10.d[0]) return new l(B(+a, u));
  if (a = new l(a), a.eq(1)) return a;
  if (n = l.precision, o = l.rounding, e10.eq(1)) return y(a, n, o);
  if (r = Y(e10.e / E), r >= e10.d.length - 1 && (t = u < 0 ? -u : u) <= ap) return i = Ms(l, a, t, n), e10.s < 0 ? new l(1).div(i) : y(i, n, o);
  if (s = a.s, s < 0) {
    if (r < e10.d.length - 1) return new l(NaN);
    if ((e10.d[r] & 1) == 0 && (s = 1), a.e == 0 && a.d[0] == 1 && a.d.length == 1) return a.s = s, a;
  }
  return t = B(+a, u), r = t == 0 || !isFinite(t) ? Y(u * (Math.log("0." + W(a.d)) / Math.LN10 + a.e + 1)) : new l(t + "").e, r > l.maxE + 1 || r < l.minE - 1 ? new l(r > 0 ? s / 0 : 0) : (w = false, l.rounding = a.s = 1, t = Math.min(12, (r + "").length), i = Mi(e10.times(Je(a, n + t)), n), i.d && (i = y(i, n + 5, 1), st(i.d, n, o) && (r = n + 10, i = y(Mi(e10.times(Je(a, r + t)), r), r + 5, 1), +W(i.d).slice(n + 1, n + 15) + 1 == 1e14 && (i = y(i, n + 1, 0)))), i.s = s, w = true, l.rounding = o, y(i, n, o));
};
m.toPrecision = function(e10, r) {
  var t, n = this, i = n.constructor;
  return e10 === void 0 ? t = ve(n, n.e <= i.toExpNeg || n.e >= i.toExpPos) : (te(e10, 1, He), r === void 0 ? r = i.rounding : te(r, 0, 8), n = y(new i(n), e10, r), t = ve(n, e10 <= n.e || n.e <= i.toExpNeg, e10)), n.isNeg() && !n.isZero() ? "-" + t : t;
};
m.toSignificantDigits = m.toSD = function(e10, r) {
  var t = this, n = t.constructor;
  return e10 === void 0 ? (e10 = n.precision, r = n.rounding) : (te(e10, 1, He), r === void 0 ? r = n.rounding : te(r, 0, 8)), y(new n(t), e10, r);
};
m.toString = function() {
  var e10 = this, r = e10.constructor, t = ve(e10, e10.e <= r.toExpNeg || e10.e >= r.toExpPos);
  return e10.isNeg() && !e10.isZero() ? "-" + t : t;
};
m.truncated = m.trunc = function() {
  return y(new this.constructor(this), this.e + 1, 1);
};
m.valueOf = m.toJSON = function() {
  var e10 = this, r = e10.constructor, t = ve(e10, e10.e <= r.toExpNeg || e10.e >= r.toExpPos);
  return e10.isNeg() ? "-" + t : t;
};
function W(e10) {
  var r, t, n, i = e10.length - 1, o = "", s = e10[0];
  if (i > 0) {
    for (o += s, r = 1; r < i; r++) n = e10[r] + "", t = E - n.length, t && (o += We(t)), o += n;
    s = e10[r], n = s + "", t = E - n.length, t && (o += We(t));
  } else if (s === 0) return "0";
  for (; s % 10 === 0; ) s /= 10;
  return o + s;
}
__name(W, "W");
function te(e10, r, t) {
  if (e10 !== ~~e10 || e10 < r || e10 > t) throw Error(Ke + e10);
}
__name(te, "te");
function st(e10, r, t, n) {
  var i, o, s, a;
  for (o = e10[0]; o >= 10; o /= 10) --r;
  return --r < 0 ? (r += E, i = 0) : (i = Math.ceil((r + 1) / E), r %= E), o = B(10, E - r), a = e10[i] % o | 0, n == null ? r < 3 ? (r == 0 ? a = a / 100 | 0 : r == 1 && (a = a / 10 | 0), s = t < 4 && a == 99999 || t > 3 && a == 49999 || a == 5e4 || a == 0) : s = (t < 4 && a + 1 == o || t > 3 && a + 1 == o / 2) && (e10[i + 1] / o / 100 | 0) == B(10, r - 2) - 1 || (a == o / 2 || a == 0) && (e10[i + 1] / o / 100 | 0) == 0 : r < 4 ? (r == 0 ? a = a / 1e3 | 0 : r == 1 ? a = a / 100 | 0 : r == 2 && (a = a / 10 | 0), s = (n || t < 4) && a == 9999 || !n && t > 3 && a == 4999) : s = ((n || t < 4) && a + 1 == o || !n && t > 3 && a + 1 == o / 2) && (e10[i + 1] / o / 1e3 | 0) == B(10, r - 3) - 1, s;
}
__name(st, "st");
function un(e10, r, t) {
  for (var n, i = [0], o, s = 0, a = e10.length; s < a; ) {
    for (o = i.length; o--; ) i[o] *= r;
    for (i[0] += Ni.indexOf(e10.charAt(s++)), n = 0; n < i.length; n++) i[n] > t - 1 && (i[n + 1] === void 0 && (i[n + 1] = 0), i[n + 1] += i[n] / t | 0, i[n] %= t);
  }
  return i.reverse();
}
__name(un, "un");
function up(e10, r) {
  var t, n, i;
  if (r.isZero()) return r;
  n = r.d.length, n < 32 ? (t = Math.ceil(n / 3), i = (1 / hn(4, t)).toString()) : (t = 16, i = "2.3283064365386962890625e-10"), e10.precision += t, r = Tr(e10, 1, r.times(i), new e10(1));
  for (var o = t; o--; ) {
    var s = r.times(r);
    r = s.times(s).minus(s).times(8).plus(1);
  }
  return e10.precision -= t, r;
}
__name(up, "up");
var _ = /* @__PURE__ */ function() {
  function e10(n, i, o) {
    var s, a = 0, l = n.length;
    for (n = n.slice(); l--; ) s = n[l] * i + a, n[l] = s % o | 0, a = s / o | 0;
    return a && n.unshift(a), n;
  }
  __name(e10, "e");
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
    var u, c, p, d, f, h, g, I, T, S, b, D, me, ie, Wr, V, re, Ae, J, mr, Mt = n.constructor, Jn = n.s == i.s ? 1 : -1, K = n.d, O = i.d;
    if (!K || !K[0] || !O || !O[0]) return new Mt(!n.s || !i.s || (K ? O && K[0] == O[0] : !O) ? NaN : K && K[0] == 0 || !O ? Jn * 0 : Jn / 0);
    for (l ? (f = 1, c = n.e - i.e) : (l = fe, f = E, c = Y(n.e / f) - Y(i.e / f)), J = O.length, re = K.length, T = new Mt(Jn), S = T.d = [], p = 0; O[p] == (K[p] || 0); p++) ;
    if (O[p] > (K[p] || 0) && c--, o == null ? (ie = o = Mt.precision, s = Mt.rounding) : a ? ie = o + (n.e - i.e) + 1 : ie = o, ie < 0) S.push(1), h = true;
    else {
      if (ie = ie / f + 2 | 0, p = 0, J == 1) {
        for (d = 0, O = O[0], ie++; (p < re || d) && ie--; p++) Wr = d * l + (K[p] || 0), S[p] = Wr / O | 0, d = Wr % O | 0;
        h = d || p < re;
      } else {
        for (d = l / (O[0] + 1) | 0, d > 1 && (O = e10(O, d, l), K = e10(K, d, l), J = O.length, re = K.length), V = J, b = K.slice(0, J), D = b.length; D < J; ) b[D++] = 0;
        mr = O.slice(), mr.unshift(0), Ae = O[0], O[1] >= l / 2 && ++Ae;
        do
          d = 0, u = r(O, b, J, D), u < 0 ? (me = b[0], J != D && (me = me * l + (b[1] || 0)), d = me / Ae | 0, d > 1 ? (d >= l && (d = l - 1), g = e10(O, d, l), I = g.length, D = b.length, u = r(g, b, I, D), u == 1 && (d--, t(g, J < I ? mr : O, I, l))) : (d == 0 && (u = d = 1), g = O.slice()), I = g.length, I < D && g.unshift(0), t(b, g, D, l), u == -1 && (D = b.length, u = r(O, b, J, D), u < 1 && (d++, t(b, J < D ? mr : O, D, l))), D = b.length) : u === 0 && (d++, b = [0]), S[p++] = d, u && b[0] ? b[D++] = K[V] || 0 : (b = [K[V]], D = 1);
        while ((V++ < re || b[0] !== void 0) && ie--);
        h = b[0] !== void 0;
      }
      S[0] || S.shift();
    }
    if (f == 1) T.e = c, Os = h;
    else {
      for (p = 1, d = S[0]; d >= 10; d /= 10) p++;
      T.e = p + c * f - 1, y(T, a ? o + T.e + 1 : o, s, h);
    }
    return T;
  };
}();
function y(e10, r, t, n) {
  var i, o, s, a, l, u, c, p, d, f = e10.constructor;
  e: if (r != null) {
    if (p = e10.d, !p) return e10;
    for (i = 1, a = p[0]; a >= 10; a /= 10) i++;
    if (o = r - i, o < 0) o += E, s = r, c = p[d = 0], l = c / B(10, i - s - 1) % 10 | 0;
    else if (d = Math.ceil((o + 1) / E), a = p.length, d >= a) if (n) {
      for (; a++ <= d; ) p.push(0);
      c = l = 0, i = 1, o %= E, s = o - E + 1;
    } else break e;
    else {
      for (c = a = p[d], i = 1; a >= 10; a /= 10) i++;
      o %= E, s = o - E + i, l = s < 0 ? 0 : c / B(10, i - s - 1) % 10 | 0;
    }
    if (n = n || r < 0 || p[d + 1] !== void 0 || (s < 0 ? c : c % B(10, i - s - 1)), u = t < 4 ? (l || n) && (t == 0 || t == (e10.s < 0 ? 3 : 2)) : l > 5 || l == 5 && (t == 4 || n || t == 6 && (o > 0 ? s > 0 ? c / B(10, i - s) : 0 : p[d - 1]) % 10 & 1 || t == (e10.s < 0 ? 8 : 7)), r < 1 || !p[0]) return p.length = 0, u ? (r -= e10.e + 1, p[0] = B(10, (E - r % E) % E), e10.e = -r || 0) : p[0] = e10.e = 0, e10;
    if (o == 0 ? (p.length = d, a = 1, d--) : (p.length = d + 1, a = B(10, E - o), p[d] = s > 0 ? (c / B(10, i - s) % B(10, s) | 0) * a : 0), u) for (; ; ) if (d == 0) {
      for (o = 1, s = p[0]; s >= 10; s /= 10) o++;
      for (s = p[0] += a, a = 1; s >= 10; s /= 10) a++;
      o != a && (e10.e++, p[0] == fe && (p[0] = 1));
      break;
    } else {
      if (p[d] += a, p[d] != fe) break;
      p[d--] = 0, a = 1;
    }
    for (o = p.length; p[--o] === 0; ) p.pop();
  }
  return w && (e10.e > f.maxE ? (e10.d = null, e10.e = NaN) : e10.e < f.minE && (e10.e = 0, e10.d = [0])), e10;
}
__name(y, "y");
function ve(e10, r, t) {
  if (!e10.isFinite()) return qs(e10);
  var n, i = e10.e, o = W(e10.d), s = o.length;
  return r ? (t && (n = t - s) > 0 ? o = o.charAt(0) + "." + o.slice(1) + We(n) : s > 1 && (o = o.charAt(0) + "." + o.slice(1)), o = o + (e10.e < 0 ? "e" : "e+") + e10.e) : i < 0 ? (o = "0." + We(-i - 1) + o, t && (n = t - s) > 0 && (o += We(n))) : i >= s ? (o += We(i + 1 - s), t && (n = t - i - 1) > 0 && (o = o + "." + We(n))) : ((n = i + 1) < s && (o = o.slice(0, n) + "." + o.slice(n)), t && (n = t - s) > 0 && (i + 1 === s && (o += "."), o += We(n))), o;
}
__name(ve, "ve");
function gn(e10, r) {
  var t = e10[0];
  for (r *= E; t >= 10; t /= 10) r++;
  return r;
}
__name(gn, "gn");
function mn(e10, r, t) {
  if (r > lp) throw w = true, t && (e10.precision = t), Error(ks);
  return y(new e10(pn), r, 1, true);
}
__name(mn, "mn");
function xe(e10, r, t) {
  if (r > Fi) throw Error(ks);
  return y(new e10(dn), r, t, true);
}
__name(xe, "xe");
function Fs(e10) {
  var r = e10.length - 1, t = r * E + 1;
  if (r = e10[r], r) {
    for (; r % 10 == 0; r /= 10) t--;
    for (r = e10[0]; r >= 10; r /= 10) t++;
  }
  return t;
}
__name(Fs, "Fs");
function We(e10) {
  for (var r = ""; e10--; ) r += "0";
  return r;
}
__name(We, "We");
function Ms(e10, r, t, n) {
  var i, o = new e10(1), s = Math.ceil(n / E + 4);
  for (w = false; ; ) {
    if (t % 2 && (o = o.times(r), Is(o.d, s) && (i = true)), t = Y(t / 2), t === 0) {
      t = o.d.length - 1, i && o.d[t] === 0 && ++o.d[t];
      break;
    }
    r = r.times(r), Is(r.d, s);
  }
  return w = true, o;
}
__name(Ms, "Ms");
function Cs(e10) {
  return e10.d[e10.d.length - 1] & 1;
}
__name(Cs, "Cs");
function $s(e10, r, t) {
  for (var n, i, o = new e10(r[0]), s = 0; ++s < r.length; ) {
    if (i = new e10(r[s]), !i.s) {
      o = i;
      break;
    }
    n = o.cmp(i), (n === t || n === 0 && o.s === t) && (o = i);
  }
  return o;
}
__name($s, "$s");
function Mi(e10, r) {
  var t, n, i, o, s, a, l, u = 0, c = 0, p = 0, d = e10.constructor, f = d.rounding, h = d.precision;
  if (!e10.d || !e10.d[0] || e10.e > 17) return new d(e10.d ? e10.d[0] ? e10.s < 0 ? 0 : 1 / 0 : 1 : e10.s ? e10.s < 0 ? 0 : e10 : NaN);
  for (r == null ? (w = false, l = h) : l = r, a = new d(0.03125); e10.e > -2; ) e10 = e10.times(a), p += 5;
  for (n = Math.log(B(2, p)) / Math.LN10 * 2 + 5 | 0, l += n, t = o = s = new d(1), d.precision = l; ; ) {
    if (o = y(o.times(e10), l, 1), t = t.times(++c), a = s.plus(_(o, t, l, 1)), W(a.d).slice(0, l) === W(s.d).slice(0, l)) {
      for (i = p; i--; ) s = y(s.times(s), l, 1);
      if (r == null) if (u < 3 && st(s.d, l - n, f, u)) d.precision = l += 10, t = o = a = new d(1), c = 0, u++;
      else return y(s, d.precision = h, f, w = true);
      else return d.precision = h, s;
    }
    s = a;
  }
}
__name(Mi, "Mi");
function Je(e10, r) {
  var t, n, i, o, s, a, l, u, c, p, d, f = 1, h = 10, g = e10, I = g.d, T = g.constructor, S = T.rounding, b = T.precision;
  if (g.s < 0 || !I || !I[0] || !g.e && I[0] == 1 && I.length == 1) return new T(I && !I[0] ? -1 / 0 : g.s != 1 ? NaN : I ? 0 : g);
  if (r == null ? (w = false, c = b) : c = r, T.precision = c += h, t = W(I), n = t.charAt(0), Math.abs(o = g.e) < 15e14) {
    for (; n < 7 && n != 1 || n == 1 && t.charAt(1) > 3; ) g = g.times(e10), t = W(g.d), n = t.charAt(0), f++;
    o = g.e, n > 1 ? (g = new T("0." + t), o++) : g = new T(n + "." + t.slice(1));
  } else return u = mn(T, c + 2, b).times(o + ""), g = Je(new T(n + "." + t.slice(1)), c - h).plus(u), T.precision = b, r == null ? y(g, b, S, w = true) : g;
  for (p = g, l = s = g = _(g.minus(1), g.plus(1), c, 1), d = y(g.times(g), c, 1), i = 3; ; ) {
    if (s = y(s.times(d), c, 1), u = l.plus(_(s, new T(i), c, 1)), W(u.d).slice(0, c) === W(l.d).slice(0, c)) if (l = l.times(2), o !== 0 && (l = l.plus(mn(T, c + 2, b).times(o + ""))), l = _(l, new T(f), c, 1), r == null) if (st(l.d, c - h, S, a)) T.precision = c += h, u = s = g = _(p.minus(1), p.plus(1), c, 1), d = y(g.times(g), c, 1), i = a = 1;
    else return y(l, T.precision = b, S, w = true);
    else return T.precision = b, l;
    l = u, i += 2;
  }
}
__name(Je, "Je");
function qs(e10) {
  return String(e10.s * e10.s / 0);
}
__name(qs, "qs");
function cn(e10, r) {
  var t, n, i;
  for ((t = r.indexOf(".")) > -1 && (r = r.replace(".", "")), (n = r.search(/e/i)) > 0 ? (t < 0 && (t = n), t += +r.slice(n + 1), r = r.substring(0, n)) : t < 0 && (t = r.length), n = 0; r.charCodeAt(n) === 48; n++) ;
  for (i = r.length; r.charCodeAt(i - 1) === 48; --i) ;
  if (r = r.slice(n, i), r) {
    if (i -= n, e10.e = t = t - n - 1, e10.d = [], n = (t + 1) % E, t < 0 && (n += E), n < i) {
      for (n && e10.d.push(+r.slice(0, n)), i -= E; n < i; ) e10.d.push(+r.slice(n, n += E));
      r = r.slice(n), n = E - r.length;
    } else n -= i;
    for (; n--; ) r += "0";
    e10.d.push(+r), w && (e10.e > e10.constructor.maxE ? (e10.d = null, e10.e = NaN) : e10.e < e10.constructor.minE && (e10.e = 0, e10.d = [0]));
  } else e10.e = 0, e10.d = [0];
  return e10;
}
__name(cn, "cn");
function cp(e10, r) {
  var t, n, i, o, s, a, l, u, c;
  if (r.indexOf("_") > -1) {
    if (r = r.replace(/(\d)_(?=\d)/g, "$1"), Ls.test(r)) return cn(e10, r);
  } else if (r === "Infinity" || r === "NaN") return +r || (e10.s = NaN), e10.e = NaN, e10.d = null, e10;
  if (op.test(r)) t = 16, r = r.toLowerCase();
  else if (ip.test(r)) t = 2;
  else if (sp.test(r)) t = 8;
  else throw Error(Ke + r);
  for (o = r.search(/p/i), o > 0 ? (l = +r.slice(o + 1), r = r.substring(2, o)) : r = r.slice(2), o = r.indexOf("."), s = o >= 0, n = e10.constructor, s && (r = r.replace(".", ""), a = r.length, o = a - o, i = Ms(n, new n(t), o, o * 2)), u = un(r, t, fe), c = u.length - 1, o = c; u[o] === 0; --o) u.pop();
  return o < 0 ? new n(e10.s * 0) : (e10.e = gn(u, c), e10.d = u, w = false, s && (e10 = _(e10, i, a * 4)), l && (e10 = e10.times(Math.abs(l) < 54 ? B(2, l) : Le.pow(2, l))), w = true, e10);
}
__name(cp, "cp");
function pp(e10, r) {
  var t, n = r.d.length;
  if (n < 3) return r.isZero() ? r : Tr(e10, 2, r, r);
  t = 1.4 * Math.sqrt(n), t = t > 16 ? 16 : t | 0, r = r.times(1 / hn(5, t)), r = Tr(e10, 2, r, r);
  for (var i, o = new e10(5), s = new e10(16), a = new e10(20); t--; ) i = r.times(r), r = r.times(o.plus(i.times(s.times(i).minus(a))));
  return r;
}
__name(pp, "pp");
function Tr(e10, r, t, n, i) {
  var o, s, a, l, u = 1, c = e10.precision, p = Math.ceil(c / E);
  for (w = false, l = t.times(t), a = new e10(n); ; ) {
    if (s = _(a.times(l), new e10(r++ * r++), c, 1), a = i ? n.plus(s) : n.minus(s), n = _(s.times(l), new e10(r++ * r++), c, 1), s = a.plus(n), s.d[p] !== void 0) {
      for (o = p; s.d[o] === a.d[o] && o--; ) ;
      if (o == -1) break;
    }
    o = a, a = n, n = s, s = o, u++;
  }
  return w = true, s.d.length = p + 1, s;
}
__name(Tr, "Tr");
function hn(e10, r) {
  for (var t = e10; --r; ) t *= e10;
  return t;
}
__name(hn, "hn");
function Vs(e10, r) {
  var t, n = r.s < 0, i = xe(e10, e10.precision, 1), o = i.times(0.5);
  if (r = r.abs(), r.lte(o)) return Ne = n ? 4 : 1, r;
  if (t = r.divToInt(i), t.isZero()) Ne = n ? 3 : 2;
  else {
    if (r = r.minus(t.times(i)), r.lte(o)) return Ne = Cs(t) ? n ? 2 : 3 : n ? 4 : 1, r;
    Ne = Cs(t) ? n ? 1 : 4 : n ? 3 : 2;
  }
  return r.minus(i).abs();
}
__name(Vs, "Vs");
function $i(e10, r, t, n) {
  var i, o, s, a, l, u, c, p, d, f = e10.constructor, h = t !== void 0;
  if (h ? (te(t, 1, He), n === void 0 ? n = f.rounding : te(n, 0, 8)) : (t = f.precision, n = f.rounding), !e10.isFinite()) c = qs(e10);
  else {
    for (c = ve(e10), s = c.indexOf("."), h ? (i = 2, r == 16 ? t = t * 4 - 3 : r == 8 && (t = t * 3 - 2)) : i = r, s >= 0 && (c = c.replace(".", ""), d = new f(1), d.e = c.length - s, d.d = un(ve(d), 10, i), d.e = d.d.length), p = un(c, 10, i), o = l = p.length; p[--l] == 0; ) p.pop();
    if (!p[0]) c = h ? "0p+0" : "0";
    else {
      if (s < 0 ? o-- : (e10 = new f(e10), e10.d = p, e10.e = o, e10 = _(e10, d, t, n, 0, i), p = e10.d, o = e10.e, u = Os), s = p[t], a = i / 2, u = u || p[t + 1] !== void 0, u = n < 4 ? (s !== void 0 || u) && (n === 0 || n === (e10.s < 0 ? 3 : 2)) : s > a || s === a && (n === 4 || u || n === 6 && p[t - 1] & 1 || n === (e10.s < 0 ? 8 : 7)), p.length = t, u) for (; ++p[--t] > i - 1; ) p[t] = 0, t || (++o, p.unshift(1));
      for (l = p.length; !p[l - 1]; --l) ;
      for (s = 0, c = ""; s < l; s++) c += Ni.charAt(p[s]);
      if (h) {
        if (l > 1) if (r == 16 || r == 8) {
          for (s = r == 16 ? 4 : 3, --l; l % s; l++) c += "0";
          for (p = un(c, i, r), l = p.length; !p[l - 1]; --l) ;
          for (s = 1, c = "1."; s < l; s++) c += Ni.charAt(p[s]);
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
  return e10.s < 0 ? "-" + c : c;
}
__name($i, "$i");
function Is(e10, r) {
  if (e10.length > r) return e10.length = r, true;
}
__name(Is, "Is");
function dp(e10) {
  return new this(e10).abs();
}
__name(dp, "dp");
function mp(e10) {
  return new this(e10).acos();
}
__name(mp, "mp");
function fp(e10) {
  return new this(e10).acosh();
}
__name(fp, "fp");
function gp(e10, r) {
  return new this(e10).plus(r);
}
__name(gp, "gp");
function hp(e10) {
  return new this(e10).asin();
}
__name(hp, "hp");
function yp(e10) {
  return new this(e10).asinh();
}
__name(yp, "yp");
function bp(e10) {
  return new this(e10).atan();
}
__name(bp, "bp");
function Ep(e10) {
  return new this(e10).atanh();
}
__name(Ep, "Ep");
function wp(e10, r) {
  e10 = new this(e10), r = new this(r);
  var t, n = this.precision, i = this.rounding, o = n + 4;
  return !e10.s || !r.s ? t = new this(NaN) : !e10.d && !r.d ? (t = xe(this, o, 1).times(r.s > 0 ? 0.25 : 0.75), t.s = e10.s) : !r.d || e10.isZero() ? (t = r.s < 0 ? xe(this, n, i) : new this(0), t.s = e10.s) : !e10.d || r.isZero() ? (t = xe(this, o, 1).times(0.5), t.s = e10.s) : r.s < 0 ? (this.precision = o, this.rounding = 1, t = this.atan(_(e10, r, o, 1)), r = xe(this, o, 1), this.precision = n, this.rounding = i, t = e10.s < 0 ? t.minus(r) : t.plus(r)) : t = this.atan(_(e10, r, o, 1)), t;
}
__name(wp, "wp");
function xp(e10) {
  return new this(e10).cbrt();
}
__name(xp, "xp");
function vp(e10) {
  return y(e10 = new this(e10), e10.e + 1, 2);
}
__name(vp, "vp");
function Pp(e10, r, t) {
  return new this(e10).clamp(r, t);
}
__name(Pp, "Pp");
function Tp(e10) {
  if (!e10 || typeof e10 != "object") throw Error(fn + "Object expected");
  var r, t, n, i = e10.defaults === true, o = ["precision", 1, He, "rounding", 0, 8, "toExpNeg", -Pr, 0, "toExpPos", 0, Pr, "maxE", 0, Pr, "minE", -Pr, 0, "modulo", 0, 9];
  for (r = 0; r < o.length; r += 3) if (t = o[r], i && (this[t] = Li[t]), (n = e10[t]) !== void 0) if (Y(n) === n && n >= o[r + 1] && n <= o[r + 2]) this[t] = n;
  else throw Error(Ke + t + ": " + n);
  if (t = "crypto", i && (this[t] = Li[t]), (n = e10[t]) !== void 0) if (n === true || n === false || n === 0 || n === 1) if (n) if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes)) this[t] = true;
  else throw Error(_s);
  else this[t] = false;
  else throw Error(Ke + t + ": " + n);
  return this;
}
__name(Tp, "Tp");
function Sp(e10) {
  return new this(e10).cos();
}
__name(Sp, "Sp");
function Rp(e10) {
  return new this(e10).cosh();
}
__name(Rp, "Rp");
function js(e10) {
  var r, t, n;
  function i(o) {
    var s, a, l, u = this;
    if (!(u instanceof i)) return new i(o);
    if (u.constructor = i, Ds(o)) {
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
      return cn(u, o.toString());
    }
    if (l === "string") return (a = o.charCodeAt(0)) === 45 ? (o = o.slice(1), u.s = -1) : (a === 43 && (o = o.slice(1)), u.s = 1), Ls.test(o) ? cn(u, o) : cp(u, o);
    if (l === "bigint") return o < 0 ? (o = -o, u.s = -1) : u.s = 1, cn(u, o.toString());
    throw Error(Ke + o);
  }
  __name(i, "i");
  if (i.prototype = m, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.EUCLID = 9, i.config = i.set = Tp, i.clone = js, i.isDecimal = Ds, i.abs = dp, i.acos = mp, i.acosh = fp, i.add = gp, i.asin = hp, i.asinh = yp, i.atan = bp, i.atanh = Ep, i.atan2 = wp, i.cbrt = xp, i.ceil = vp, i.clamp = Pp, i.cos = Sp, i.cosh = Rp, i.div = Ap, i.exp = Cp, i.floor = Ip, i.hypot = Dp, i.ln = Op, i.log = kp, i.log10 = Np, i.log2 = _p, i.max = Lp, i.min = Fp, i.mod = Mp, i.mul = $p, i.pow = qp, i.random = Vp, i.round = jp, i.sign = Bp, i.sin = Up, i.sinh = Gp, i.sqrt = Qp, i.sub = Wp, i.sum = Jp, i.tan = Kp, i.tanh = Hp, i.trunc = Yp, e10 === void 0 && (e10 = {}), e10 && e10.defaults !== true) for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], r = 0; r < n.length; ) e10.hasOwnProperty(t = n[r++]) || (e10[t] = this[t]);
  return i.config(e10), i;
}
__name(js, "js");
function Ap(e10, r) {
  return new this(e10).div(r);
}
__name(Ap, "Ap");
function Cp(e10) {
  return new this(e10).exp();
}
__name(Cp, "Cp");
function Ip(e10) {
  return y(e10 = new this(e10), e10.e + 1, 3);
}
__name(Ip, "Ip");
function Dp() {
  var e10, r, t = new this(0);
  for (w = false, e10 = 0; e10 < arguments.length; ) if (r = new this(arguments[e10++]), r.d) t.d && (t = t.plus(r.times(r)));
  else {
    if (r.s) return w = true, new this(1 / 0);
    t = r;
  }
  return w = true, t.sqrt();
}
__name(Dp, "Dp");
function Ds(e10) {
  return e10 instanceof Le || e10 && e10.toStringTag === Ns || false;
}
__name(Ds, "Ds");
function Op(e10) {
  return new this(e10).ln();
}
__name(Op, "Op");
function kp(e10, r) {
  return new this(e10).log(r);
}
__name(kp, "kp");
function _p(e10) {
  return new this(e10).log(2);
}
__name(_p, "_p");
function Np(e10) {
  return new this(e10).log(10);
}
__name(Np, "Np");
function Lp() {
  return $s(this, arguments, -1);
}
__name(Lp, "Lp");
function Fp() {
  return $s(this, arguments, 1);
}
__name(Fp, "Fp");
function Mp(e10, r) {
  return new this(e10).mod(r);
}
__name(Mp, "Mp");
function $p(e10, r) {
  return new this(e10).mul(r);
}
__name($p, "$p");
function qp(e10, r) {
  return new this(e10).pow(r);
}
__name(qp, "qp");
function Vp(e10) {
  var r, t, n, i, o = 0, s = new this(1), a = [];
  if (e10 === void 0 ? e10 = this.precision : te(e10, 1, He), n = Math.ceil(e10 / E), this.crypto) if (crypto.getRandomValues) for (r = crypto.getRandomValues(new Uint32Array(n)); o < n; ) i = r[o], i >= 429e7 ? r[o] = crypto.getRandomValues(new Uint32Array(1))[0] : a[o++] = i % 1e7;
  else if (crypto.randomBytes) {
    for (r = crypto.randomBytes(n *= 4); o < n; ) i = r[o] + (r[o + 1] << 8) + (r[o + 2] << 16) + ((r[o + 3] & 127) << 24), i >= 214e7 ? crypto.randomBytes(4).copy(r, o) : (a.push(i % 1e7), o += 4);
    o = n / 4;
  } else throw Error(_s);
  else for (; o < n; ) a[o++] = Math.random() * 1e7 | 0;
  for (n = a[--o], e10 %= E, n && e10 && (i = B(10, E - e10), a[o] = (n / i | 0) * i); a[o] === 0; o--) a.pop();
  if (o < 0) t = 0, a = [0];
  else {
    for (t = -1; a[0] === 0; t -= E) a.shift();
    for (n = 1, i = a[0]; i >= 10; i /= 10) n++;
    n < E && (t -= E - n);
  }
  return s.e = t, s.d = a, s;
}
__name(Vp, "Vp");
function jp(e10) {
  return y(e10 = new this(e10), e10.e + 1, this.rounding);
}
__name(jp, "jp");
function Bp(e10) {
  return e10 = new this(e10), e10.d ? e10.d[0] ? e10.s : 0 * e10.s : e10.s || NaN;
}
__name(Bp, "Bp");
function Up(e10) {
  return new this(e10).sin();
}
__name(Up, "Up");
function Gp(e10) {
  return new this(e10).sinh();
}
__name(Gp, "Gp");
function Qp(e10) {
  return new this(e10).sqrt();
}
__name(Qp, "Qp");
function Wp(e10, r) {
  return new this(e10).sub(r);
}
__name(Wp, "Wp");
function Jp() {
  var e10 = 0, r = arguments, t = new this(r[e10]);
  for (w = false; t.s && ++e10 < r.length; ) t = t.plus(r[e10]);
  return w = true, y(t, this.precision, this.rounding);
}
__name(Jp, "Jp");
function Kp(e10) {
  return new this(e10).tan();
}
__name(Kp, "Kp");
function Hp(e10) {
  return new this(e10).tanh();
}
__name(Hp, "Hp");
function Yp(e10) {
  return y(e10 = new this(e10), e10.e + 1, 1);
}
__name(Yp, "Yp");
m[Symbol.for("nodejs.util.inspect.custom")] = m.toString;
m[Symbol.toStringTag] = "Decimal";
var Le = m.constructor = js(Li);
pn = new Le(pn);
dn = new Le(dn);
var Ye = Le;
function Sr(e10) {
  return Le.isDecimal(e10) ? true : e10 !== null && typeof e10 == "object" && typeof e10.s == "number" && typeof e10.e == "number" && typeof e10.toFixed == "function" && Array.isArray(e10.d);
}
__name(Sr, "Sr");
var yn = {};
gr(yn, { ModelAction: /* @__PURE__ */ __name(() => Rr, "ModelAction"), datamodelEnumToSchemaEnum: /* @__PURE__ */ __name(() => zp, "datamodelEnumToSchemaEnum") });
function zp(e10) {
  return { name: e10.name, values: e10.values.map((r) => r.name) };
}
__name(zp, "zp");
var Rr = ((b) => (b.findUnique = "findUnique", b.findUniqueOrThrow = "findUniqueOrThrow", b.findFirst = "findFirst", b.findFirstOrThrow = "findFirstOrThrow", b.findMany = "findMany", b.create = "create", b.createMany = "createMany", b.createManyAndReturn = "createManyAndReturn", b.update = "update", b.updateMany = "updateMany", b.updateManyAndReturn = "updateManyAndReturn", b.upsert = "upsert", b.delete = "delete", b.deleteMany = "deleteMany", b.groupBy = "groupBy", b.count = "count", b.aggregate = "aggregate", b.findRaw = "findRaw", b.aggregateRaw = "aggregateRaw", b))(Rr || {});
var Qs = le(wi());
var Bs = { keyword: De, entity: De, value: /* @__PURE__ */ __name((e10) => Q(tr(e10)), "value"), punctuation: tr, directive: De, function: De, variable: /* @__PURE__ */ __name((e10) => Q(tr(e10)), "variable"), string: /* @__PURE__ */ __name((e10) => Q($e(e10)), "string"), boolean: Ie, number: De, comment: Jr };
var Zp = /* @__PURE__ */ __name((e10) => e10, "Zp");
var bn = {};
var Xp = 0;
var v = { manual: bn.Prism && bn.Prism.manual, disableWorkerMessageHandler: bn.Prism && bn.Prism.disableWorkerMessageHandler, util: { encode: /* @__PURE__ */ __name(function(e10) {
  if (e10 instanceof ge) {
    let r = e10;
    return new ge(r.type, v.util.encode(r.content), r.alias);
  } else return Array.isArray(e10) ? e10.map(v.util.encode) : e10.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ");
}, "encode"), type: /* @__PURE__ */ __name(function(e10) {
  return Object.prototype.toString.call(e10).slice(8, -1);
}, "type"), objId: /* @__PURE__ */ __name(function(e10) {
  return e10.__id || Object.defineProperty(e10, "__id", { value: ++Xp }), e10.__id;
}, "objId"), clone: /* @__PURE__ */ __name(function e3(r, t) {
  let n, i, o = v.util.type(r);
  switch (t = t || {}, o) {
    case "Object":
      if (i = v.util.objId(r), t[i]) return t[i];
      n = {}, t[i] = n;
      for (let s in r) r.hasOwnProperty(s) && (n[s] = e3(r[s], t));
      return n;
    case "Array":
      return i = v.util.objId(r), t[i] ? t[i] : (n = [], t[i] = n, r.forEach(function(s, a) {
        n[a] = e3(s, t);
      }), n);
    default:
      return r;
  }
}, "e") }, languages: { extend: /* @__PURE__ */ __name(function(e10, r) {
  let t = v.util.clone(v.languages[e10]);
  for (let n in r) t[n] = r[n];
  return t;
}, "extend"), insertBefore: /* @__PURE__ */ __name(function(e10, r, t, n) {
  n = n || v.languages;
  let i = n[e10], o = {};
  for (let a in i) if (i.hasOwnProperty(a)) {
    if (a == r) for (let l in t) t.hasOwnProperty(l) && (o[l] = t[l]);
    t.hasOwnProperty(a) || (o[a] = i[a]);
  }
  let s = n[e10];
  return n[e10] = o, v.languages.DFS(v.languages, function(a, l) {
    l === s && a != e10 && (this[a] = o);
  }), o;
}, "insertBefore"), DFS: /* @__PURE__ */ __name(function e4(r, t, n, i) {
  i = i || {};
  let o = v.util.objId;
  for (let s in r) if (r.hasOwnProperty(s)) {
    t.call(r, s, r[s], n || s);
    let a = r[s], l = v.util.type(a);
    l === "Object" && !i[o(a)] ? (i[o(a)] = true, e4(a, t, null, i)) : l === "Array" && !i[o(a)] && (i[o(a)] = true, e4(a, t, s, i));
  }
}, "e") }, plugins: {}, highlight: /* @__PURE__ */ __name(function(e10, r, t) {
  let n = { code: e10, grammar: r, language: t };
  return v.hooks.run("before-tokenize", n), n.tokens = v.tokenize(n.code, n.grammar), v.hooks.run("after-tokenize", n), ge.stringify(v.util.encode(n.tokens), n.language);
}, "highlight"), matchGrammar: /* @__PURE__ */ __name(function(e10, r, t, n, i, o, s) {
  for (let g in t) {
    if (!t.hasOwnProperty(g) || !t[g]) continue;
    if (g == s) return;
    let I = t[g];
    I = v.util.type(I) === "Array" ? I : [I];
    for (let T = 0; T < I.length; ++T) {
      let S = I[T], b = S.inside, D = !!S.lookbehind, me = !!S.greedy, ie = 0, Wr = S.alias;
      if (me && !S.pattern.global) {
        let V = S.pattern.toString().match(/[imuy]*$/)[0];
        S.pattern = RegExp(S.pattern.source, V + "g");
      }
      S = S.pattern || S;
      for (let V = n, re = i; V < r.length; re += r[V].length, ++V) {
        let Ae = r[V];
        if (r.length > e10.length) return;
        if (Ae instanceof ge) continue;
        if (me && V != r.length - 1) {
          S.lastIndex = re;
          var p = S.exec(e10);
          if (!p) break;
          var c = p.index + (D ? p[1].length : 0), d = p.index + p[0].length, a = V, l = re;
          for (let O = r.length; a < O && (l < d || !r[a].type && !r[a - 1].greedy); ++a) l += r[a].length, c >= l && (++V, re = l);
          if (r[V] instanceof ge) continue;
          u = a - V, Ae = e10.slice(re, l), p.index -= re;
        } else {
          S.lastIndex = 0;
          var p = S.exec(Ae), u = 1;
        }
        if (!p) {
          if (o) break;
          continue;
        }
        D && (ie = p[1] ? p[1].length : 0);
        var c = p.index + ie, p = p[0].slice(ie), d = c + p.length, f = Ae.slice(0, c), h = Ae.slice(d);
        let J = [V, u];
        f && (++V, re += f.length, J.push(f));
        let mr = new ge(g, b ? v.tokenize(p, b) : p, Wr, p, me);
        if (J.push(mr), h && J.push(h), Array.prototype.splice.apply(r, J), u != 1 && v.matchGrammar(e10, r, t, V, re, true, g), o) break;
      }
    }
  }
}, "matchGrammar"), tokenize: /* @__PURE__ */ __name(function(e10, r) {
  let t = [e10], n = r.rest;
  if (n) {
    for (let i in n) r[i] = n[i];
    delete r.rest;
  }
  return v.matchGrammar(e10, t, r, 0, 0, false), t;
}, "tokenize"), hooks: { all: {}, add: /* @__PURE__ */ __name(function(e10, r) {
  let t = v.hooks.all;
  t[e10] = t[e10] || [], t[e10].push(r);
}, "add"), run: /* @__PURE__ */ __name(function(e10, r) {
  let t = v.hooks.all[e10];
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
function ge(e10, r, t, n, i) {
  this.type = e10, this.content = r, this.alias = t, this.length = (n || "").length | 0, this.greedy = !!i;
}
__name(ge, "ge");
ge.stringify = function(e10, r) {
  return typeof e10 == "string" ? e10 : Array.isArray(e10) ? e10.map(function(t) {
    return ge.stringify(t, r);
  }).join("") : ed(e10.type)(e10.content);
};
function ed(e10) {
  return Bs[e10] || Zp;
}
__name(ed, "ed");
function Us(e10) {
  return rd(e10, v.languages.javascript);
}
__name(Us, "Us");
function rd(e10, r) {
  return v.tokenize(e10, r).map((n) => ge.stringify(n)).join("");
}
__name(rd, "rd");
function Gs(e10) {
  return bi(e10);
}
__name(Gs, "Gs");
var En = class e5 {
  static {
    __name(this, "e");
  }
  firstLineNumber;
  lines;
  static read(r) {
    let t;
    try {
      t = td.readFileSync(r, "utf-8");
    } catch {
      return null;
    }
    return e5.fromContent(t);
  }
  static fromContent(r) {
    let t = r.split(/\r?\n/);
    return new e5(1, t);
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
    return i[n] = t(i[n]), new e5(this.firstLineNumber, i);
  }
  mapLines(r) {
    return new e5(this.firstLineNumber, this.lines.map((t, n) => r(t, this.firstLineNumber + n)));
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
    return new e5(r, Gs(n).split(`
`));
  }
  highlight() {
    let r = Us(this.toString());
    return new e5(this.firstLineNumber, r.split(`
`));
  }
  toString() {
    return this.lines.join(`
`);
  }
};
var nd = { red: ue, gray: Jr, dim: Ce, bold: Q, underline: H, highlightSource: /* @__PURE__ */ __name((e10) => e10.highlight(), "highlightSource") };
var id = { red: /* @__PURE__ */ __name((e10) => e10, "red"), gray: /* @__PURE__ */ __name((e10) => e10, "gray"), dim: /* @__PURE__ */ __name((e10) => e10, "dim"), bold: /* @__PURE__ */ __name((e10) => e10, "bold"), underline: /* @__PURE__ */ __name((e10) => e10, "underline"), highlightSource: /* @__PURE__ */ __name((e10) => e10, "highlightSource") };
function od({ message: e10, originalMethod: r, isPanic: t, callArguments: n }) {
  return { functionName: `prisma.${r}()`, message: e10, isPanic: t ?? false, callArguments: n };
}
__name(od, "od");
function sd({ callsite: e10, message: r, originalMethod: t, isPanic: n, callArguments: i }, o) {
  let s = od({ message: r, originalMethod: t, isPanic: n, callArguments: i });
  if (!e10 || typeof window < "u" || process2.env.NODE_ENV === "production") return s;
  let a = e10.getLocation();
  if (!a || !a.lineNumber || !a.columnNumber) return s;
  let l = Math.max(1, a.lineNumber - 3), u = En.read(a.fileName)?.slice(l, a.lineNumber), c = u?.lineAt(a.lineNumber);
  if (u && c) {
    let p = ld(c), d = ad(c);
    if (!d) return s;
    s.functionName = `${d.code})`, s.location = a, n || (u = u.mapLineAt(a.lineNumber, (h) => h.slice(0, d.openingBraceIndex))), u = o.highlightSource(u);
    let f = String(u.lastLineNumber).length;
    if (s.contextLines = u.mapLines((h, g) => o.gray(String(g).padStart(f)) + " " + h).mapLines((h) => o.dim(h)).prependSymbolAt(a.lineNumber, o.bold(o.red("→"))), i) {
      let h = p + f + 1;
      h += 2, s.callArguments = (0, Qs.default)(i, h).slice(h);
    }
  }
  return s;
}
__name(sd, "sd");
function ad(e10) {
  let r = Object.keys(Rr).join("|"), n = new RegExp(String.raw`\.(${r})\(`).exec(e10);
  if (n) {
    let i = n.index + n[0].length, o = e10.lastIndexOf(" ", n.index) + 1;
    return { code: e10.slice(o, i), openingBraceIndex: i };
  }
  return null;
}
__name(ad, "ad");
function ld(e10) {
  let r = 0;
  for (let t = 0; t < e10.length; t++) {
    if (e10.charAt(t) !== " ") return r;
    r++;
  }
  return r;
}
__name(ld, "ld");
function ud({ functionName: e10, location: r, message: t, isPanic: n, contextLines: i, callArguments: o }, s) {
  let a = [""], l = r ? " in" : ":";
  if (n ? (a.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a.push(s.red(`It occurred in the ${s.bold(`\`${e10}\``)} invocation${l}`))) : a.push(s.red(`Invalid ${s.bold(`\`${e10}\``)} invocation${l}`)), r && a.push(s.underline(cd(r))), i) {
    a.push("");
    let u = [i.toString()];
    o && (u.push(o), u.push(s.dim(")"))), a.push(u.join("")), o && a.push("");
  } else a.push(""), o && a.push(o), a.push("");
  return a.push(t), a.join(`
`);
}
__name(ud, "ud");
function cd(e10) {
  let r = [e10.fileName];
  return e10.lineNumber && r.push(String(e10.lineNumber)), e10.columnNumber && r.push(String(e10.columnNumber)), r.join(":");
}
__name(cd, "cd");
function wn(e10) {
  let r = e10.showColors ? nd : id, t;
  return t = sd(e10, r), ud(t, r);
}
__name(wn, "wn");
var ea = le(qi());
function Hs(e10, r, t) {
  let n = Ys(e10), i = pd(n), o = md(i);
  o ? xn(o, r, t) : r.addErrorMessage(() => "Unknown error");
}
__name(Hs, "Hs");
function Ys(e10) {
  return e10.errors.flatMap((r) => r.kind === "Union" ? Ys(r) : [r]);
}
__name(Ys, "Ys");
function pd(e10) {
  let r = /* @__PURE__ */ new Map(), t = [];
  for (let n of e10) {
    if (n.kind !== "InvalidArgumentType") {
      t.push(n);
      continue;
    }
    let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o = r.get(i);
    o ? r.set(i, { ...n, argument: { ...n.argument, typeNames: dd(o.argument.typeNames, n.argument.typeNames) } }) : r.set(i, n);
  }
  return t.push(...r.values()), t;
}
__name(pd, "pd");
function dd(e10, r) {
  return [...new Set(e10.concat(r))];
}
__name(dd, "dd");
function md(e10) {
  return ki(e10, (r, t) => {
    let n = Js(r), i = Js(t);
    return n !== i ? n - i : Ks(r) - Ks(t);
  });
}
__name(md, "md");
function Js(e10) {
  let r = 0;
  return Array.isArray(e10.selectionPath) && (r += e10.selectionPath.length), Array.isArray(e10.argumentPath) && (r += e10.argumentPath.length), r;
}
__name(Js, "Js");
function Ks(e10) {
  switch (e10.kind) {
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
__name(Ks, "Ks");
var oe = class {
  static {
    __name(this, "oe");
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
Zs();
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
zs();
var vn = class {
  static {
    __name(this, "vn");
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
var Pn = /* @__PURE__ */ __name((e10) => e10, "Pn");
var Tn = { bold: Pn, red: Pn, green: Pn, dim: Pn, enabled: false };
var Xs = { bold: Q, red: ue, green: $e, dim: Ce, enabled: true };
var Cr = { write(e10) {
  e10.writeLine(",");
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
    return this.items.push(new vn(r)), this;
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
var Dr = class e6 extends ze {
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
      if (o.value instanceof e6 ? a = o.value.getField(s) : o.value instanceof Ir && (a = o.value.getField(Number(s))), !a) return;
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
      if (!(t instanceof e6)) return;
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
      if (!o || !(o instanceof e6)) return;
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
var G = class extends ze {
  static {
    __name(this, "G");
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
var at = class {
  static {
    __name(this, "at");
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
function xn(e10, r, t) {
  switch (e10.kind) {
    case "MutuallyExclusiveFields":
      fd(e10, r);
      break;
    case "IncludeOnScalar":
      gd(e10, r);
      break;
    case "EmptySelection":
      hd(e10, r, t);
      break;
    case "UnknownSelectionField":
      wd(e10, r);
      break;
    case "InvalidSelectionValue":
      xd(e10, r);
      break;
    case "UnknownArgument":
      vd(e10, r);
      break;
    case "UnknownInputField":
      Pd(e10, r);
      break;
    case "RequiredArgumentMissing":
      Td(e10, r);
      break;
    case "InvalidArgumentType":
      Sd(e10, r);
      break;
    case "InvalidArgumentValue":
      Rd(e10, r);
      break;
    case "ValueTooLarge":
      Ad(e10, r);
      break;
    case "SomeFieldsMissing":
      Cd(e10, r);
      break;
    case "TooManyFieldsGiven":
      Id(e10, r);
      break;
    case "Union":
      Hs(e10, r, t);
      break;
    default:
      throw new Error("not implemented: " + e10.kind);
  }
}
__name(xn, "xn");
function fd(e10, r) {
  let t = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  t && (t.getField(e10.firstField)?.markAsError(), t.getField(e10.secondField)?.markAsError()), r.addErrorMessage((n) => `Please ${n.bold("either")} use ${n.green(`\`${e10.firstField}\``)} or ${n.green(`\`${e10.secondField}\``)}, but ${n.red("not both")} at the same time.`);
}
__name(fd, "fd");
function gd(e10, r) {
  let [t, n] = Or(e10.selectionPath), i = e10.outputType, o = r.arguments.getDeepSelectionParent(t)?.value;
  if (o && (o.getField(n)?.markAsError(), i)) for (let s of i.fields) s.isRelation && o.addSuggestion(new oe(s.name, "true"));
  r.addErrorMessage((s) => {
    let a = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
    return i ? a += ` on model ${s.bold(i.name)}. ${lt(s)}` : a += ".", a += `
Note that ${s.bold("include")} statements only accept relation fields.`, a;
  });
}
__name(gd, "gd");
function hd(e10, r, t) {
  let n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  if (n) {
    let i = n.getField("omit")?.value.asObject();
    if (i) {
      yd(e10, r, i);
      return;
    }
    if (n.hasField("select")) {
      bd(e10, r);
      return;
    }
  }
  if (t?.[Qe(e10.outputType.name)]) {
    Ed(e10, r);
    return;
  }
  r.addErrorMessage(() => `Unknown field at "${e10.selectionPath.join(".")} selection"`);
}
__name(hd, "hd");
function yd(e10, r, t) {
  t.removeAllFields();
  for (let n of e10.outputType.fields) t.addSuggestion(new oe(n.name, "false"));
  r.addErrorMessage((n) => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e10.outputType.name)}. At least one field must be included in the result`);
}
__name(yd, "yd");
function bd(e10, r) {
  let t = e10.outputType, n = r.arguments.getDeepSelectionParent(e10.selectionPath)?.value, i = n?.isEmpty() ?? false;
  n && (n.removeAllFields(), na(n, t)), r.addErrorMessage((o) => i ? `The ${o.red("`select`")} statement for type ${o.bold(t.name)} must not be empty. ${lt(o)}` : `The ${o.red("`select`")} statement for type ${o.bold(t.name)} needs ${o.bold("at least one truthy value")}.`);
}
__name(bd, "bd");
function Ed(e10, r) {
  let t = new at();
  for (let i of e10.outputType.fields) i.isRelation || t.addField(i.name, "false");
  let n = new oe("omit", t).makeRequired();
  if (e10.selectionPath.length === 0) r.arguments.addSuggestion(n);
  else {
    let [i, o] = Or(e10.selectionPath), a = r.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o);
    if (a) {
      let l = a?.value.asObject() ?? new Dr();
      l.addSuggestion(n), a.value = l;
    }
  }
  r.addErrorMessage((i) => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e10.outputType.name)}. At least one field must be included in the result`);
}
__name(Ed, "Ed");
function wd(e10, r) {
  let t = ia(e10.selectionPath, r);
  if (t.parentKind !== "unknown") {
    t.field.markAsError();
    let n = t.parent;
    switch (t.parentKind) {
      case "select":
        na(n, e10.outputType);
        break;
      case "include":
        Dd(n, e10.outputType);
        break;
      case "omit":
        Od(n, e10.outputType);
        break;
    }
  }
  r.addErrorMessage((n) => {
    let i = [`Unknown field ${n.red(`\`${t.fieldName}\``)}`];
    return t.parentKind !== "unknown" && i.push(`for ${n.bold(t.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e10.outputType.name}\``)}.`), i.push(lt(n)), i.join(" ");
  });
}
__name(wd, "wd");
function xd(e10, r) {
  let t = ia(e10.selectionPath, r);
  t.parentKind !== "unknown" && t.field.value.markAsError(), r.addErrorMessage((n) => `Invalid value for selection field \`${n.red(t.fieldName)}\`: ${e10.underlyingError}`);
}
__name(xd, "xd");
function vd(e10, r) {
  let t = e10.argumentPath[0], n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  n && (n.getField(t)?.markAsError(), kd(n, e10.arguments)), r.addErrorMessage((i) => ra(i, t, e10.arguments.map((o) => o.name)));
}
__name(vd, "vd");
function Pd(e10, r) {
  let [t, n] = Or(e10.argumentPath), i = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  if (i) {
    i.getDeepField(e10.argumentPath)?.markAsError();
    let o = i.getDeepFieldValue(t)?.asObject();
    o && oa(o, e10.inputType);
  }
  r.addErrorMessage((o) => ra(o, n, e10.inputType.fields.map((s) => s.name)));
}
__name(Pd, "Pd");
function ra(e10, r, t) {
  let n = [`Unknown argument \`${e10.red(r)}\`.`], i = Nd(r, t);
  return i && n.push(`Did you mean \`${e10.green(i)}\`?`), t.length > 0 && n.push(lt(e10)), n.join(" ");
}
__name(ra, "ra");
function Td(e10, r) {
  let t;
  r.addErrorMessage((l) => t?.value instanceof G && t.value.text === "null" ? `Argument \`${l.green(o)}\` must not be ${l.red("null")}.` : `Argument \`${l.green(o)}\` is missing.`);
  let n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  if (!n) return;
  let [i, o] = Or(e10.argumentPath), s = new at(), a = n.getDeepFieldValue(i)?.asObject();
  if (a) {
    if (t = a.getField(o), t && a.removeField(o), e10.inputTypes.length === 1 && e10.inputTypes[0].kind === "object") {
      for (let l of e10.inputTypes[0].fields) s.addField(l.name, l.typeNames.join(" | "));
      a.addSuggestion(new oe(o, s).makeRequired());
    } else {
      let l = e10.inputTypes.map(ta).join(" | ");
      a.addSuggestion(new oe(o, l).makeRequired());
    }
    if (e10.dependentArgumentPath) {
      n.getDeepField(e10.dependentArgumentPath)?.markAsError();
      let [, l] = Or(e10.dependentArgumentPath);
      r.addErrorMessage((u) => `Argument \`${u.green(o)}\` is required because argument \`${u.green(l)}\` was provided.`);
    }
  }
}
__name(Td, "Td");
function ta(e10) {
  return e10.kind === "list" ? `${ta(e10.elementType)}[]` : e10.name;
}
__name(ta, "ta");
function Sd(e10, r) {
  let t = e10.argument.name, n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  n && n.getDeepFieldValue(e10.argumentPath)?.markAsError(), r.addErrorMessage((i) => {
    let o = Sn("or", e10.argument.typeNames.map((s) => i.green(s)));
    return `Argument \`${i.bold(t)}\`: Invalid value provided. Expected ${o}, provided ${i.red(e10.inferredType)}.`;
  });
}
__name(Sd, "Sd");
function Rd(e10, r) {
  let t = e10.argument.name, n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  n && n.getDeepFieldValue(e10.argumentPath)?.markAsError(), r.addErrorMessage((i) => {
    let o = [`Invalid value for argument \`${i.bold(t)}\``];
    if (e10.underlyingError && o.push(`: ${e10.underlyingError}`), o.push("."), e10.argument.typeNames.length > 0) {
      let s = Sn("or", e10.argument.typeNames.map((a) => i.green(a)));
      o.push(` Expected ${s}.`);
    }
    return o.join("");
  });
}
__name(Rd, "Rd");
function Ad(e10, r) {
  let t = e10.argument.name, n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject(), i;
  if (n) {
    let s = n.getDeepField(e10.argumentPath)?.value;
    s?.markAsError(), s instanceof G && (i = s.text);
  }
  r.addErrorMessage((o) => {
    let s = ["Unable to fit value"];
    return i && s.push(o.red(i)), s.push(`into a 64-bit signed integer for field \`${o.bold(t)}\``), s.join(" ");
  });
}
__name(Ad, "Ad");
function Cd(e10, r) {
  let t = e10.argumentPath[e10.argumentPath.length - 1], n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject();
  if (n) {
    let i = n.getDeepFieldValue(e10.argumentPath)?.asObject();
    i && oa(i, e10.inputType);
  }
  r.addErrorMessage((i) => {
    let o = [`Argument \`${i.bold(t)}\` of type ${i.bold(e10.inputType.name)} needs`];
    return e10.constraints.minFieldCount === 1 ? e10.constraints.requiredFields ? o.push(`${i.green("at least one of")} ${Sn("or", e10.constraints.requiredFields.map((s) => `\`${i.bold(s)}\``))} arguments.`) : o.push(`${i.green("at least one")} argument.`) : o.push(`${i.green(`at least ${e10.constraints.minFieldCount}`)} arguments.`), o.push(lt(i)), o.join(" ");
  });
}
__name(Cd, "Cd");
function Id(e10, r) {
  let t = e10.argumentPath[e10.argumentPath.length - 1], n = r.arguments.getDeepSubSelectionValue(e10.selectionPath)?.asObject(), i = [];
  if (n) {
    let o = n.getDeepFieldValue(e10.argumentPath)?.asObject();
    o && (o.markAsError(), i = Object.keys(o.getFields()));
  }
  r.addErrorMessage((o) => {
    let s = [`Argument \`${o.bold(t)}\` of type ${o.bold(e10.inputType.name)} needs`];
    return e10.constraints.minFieldCount === 1 && e10.constraints.maxFieldCount == 1 ? s.push(`${o.green("exactly one")} argument,`) : e10.constraints.maxFieldCount == 1 ? s.push(`${o.green("at most one")} argument,`) : s.push(`${o.green(`at most ${e10.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${Sn("and", i.map((a) => o.red(a)))}. Please choose`), e10.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e10.constraints.maxFieldCount}.`), s.join(" ");
  });
}
__name(Id, "Id");
function na(e10, r) {
  for (let t of r.fields) e10.hasField(t.name) || e10.addSuggestion(new oe(t.name, "true"));
}
__name(na, "na");
function Dd(e10, r) {
  for (let t of r.fields) t.isRelation && !e10.hasField(t.name) && e10.addSuggestion(new oe(t.name, "true"));
}
__name(Dd, "Dd");
function Od(e10, r) {
  for (let t of r.fields) !e10.hasField(t.name) && !t.isRelation && e10.addSuggestion(new oe(t.name, "true"));
}
__name(Od, "Od");
function kd(e10, r) {
  for (let t of r) e10.hasField(t.name) || e10.addSuggestion(new oe(t.name, t.typeNames.join(" | ")));
}
__name(kd, "kd");
function ia(e10, r) {
  let [t, n] = Or(e10), i = r.arguments.getDeepSubSelectionValue(t)?.asObject();
  if (!i) return { parentKind: "unknown", fieldName: n };
  let o = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a = i.getFieldValue("omit")?.asObject(), l = o?.getField(n);
  return o && l ? { parentKind: "select", parent: o, field: l, fieldName: n } : (l = s?.getField(n), s && l ? { parentKind: "include", field: l, parent: s, fieldName: n } : (l = a?.getField(n), a && l ? { parentKind: "omit", field: l, parent: a, fieldName: n } : { parentKind: "unknown", fieldName: n }));
}
__name(ia, "ia");
function oa(e10, r) {
  if (r.kind === "object") for (let t of r.fields) e10.hasField(t.name) || e10.addSuggestion(new oe(t.name, t.typeNames.join(" | ")));
}
__name(oa, "oa");
function Or(e10) {
  let r = [...e10], t = r.pop();
  if (!t) throw new Error("unexpected empty path");
  return [r, t];
}
__name(Or, "Or");
function lt({ green: e10, enabled: r }) {
  return "Available options are " + (r ? `listed in ${e10("green")}` : "marked with ?") + ".";
}
__name(lt, "lt");
function Sn(e10, r) {
  if (r.length === 1) return r[0];
  let t = [...r], n = t.pop();
  return `${t.join(", ")} ${e10} ${n}`;
}
__name(Sn, "Sn");
var _d = 3;
function Nd(e10, r) {
  let t = 1 / 0, n;
  for (let i of r) {
    let o = (0, ea.default)(e10, i);
    o > _d || o < t && (t = o, n = i);
  }
  return n;
}
__name(Nd, "Nd");
var ut = class {
  static {
    __name(this, "ut");
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
function kr(e10) {
  return e10 instanceof ut;
}
__name(kr, "kr");
var Rn = Symbol();
var ji = /* @__PURE__ */ new WeakMap();
var Fe = class {
  static {
    __name(this, "Fe");
  }
  constructor(r) {
    r === Rn ? ji.set(this, `Prisma.${this._getName()}`) : ji.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
  }
  _getName() {
    return this.constructor.name;
  }
  toString() {
    return ji.get(this);
  }
};
var ct = class extends Fe {
  static {
    __name(this, "ct");
  }
  _getNamespace() {
    return "NullTypes";
  }
};
var pt = class extends ct {
  static {
    __name(this, "pt");
  }
  #e;
};
Ui(pt, "DbNull");
var dt = class extends ct {
  static {
    __name(this, "dt");
  }
  #e;
};
Ui(dt, "JsonNull");
var mt = class extends ct {
  static {
    __name(this, "mt");
  }
  #e;
};
Ui(mt, "AnyNull");
var Bi = { classes: { DbNull: pt, JsonNull: dt, AnyNull: mt }, instances: { DbNull: new pt(Rn), JsonNull: new dt(Rn), AnyNull: new mt(Rn) } };
function Ui(e10, r) {
  Object.defineProperty(e10, "name", { value: r, configurable: true });
}
__name(Ui, "Ui");
var sa = ": ";
var An = class {
  static {
    __name(this, "An");
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
    return this.name.length + this.value.getPrintWidth() + sa.length;
  }
  write(r) {
    let t = new Pe(this.name);
    this.hasError && t.underline().setColor(r.context.colors.red), r.write(t).write(sa).write(this.value);
  }
};
var Gi = class {
  static {
    __name(this, "Gi");
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
function _r(e10) {
  return new Gi(aa(e10));
}
__name(_r, "_r");
function aa(e10) {
  let r = new Dr();
  for (let [t, n] of Object.entries(e10)) {
    let i = new An(t, la(n));
    r.addField(i);
  }
  return r;
}
__name(aa, "aa");
function la(e10) {
  if (typeof e10 == "string") return new G(JSON.stringify(e10));
  if (typeof e10 == "number" || typeof e10 == "boolean") return new G(String(e10));
  if (typeof e10 == "bigint") return new G(`${e10}n`);
  if (e10 === null) return new G("null");
  if (e10 === void 0) return new G("undefined");
  if (Sr(e10)) return new G(`new Prisma.Decimal("${e10.toFixed()}")`);
  if (e10 instanceof Uint8Array) return Buffer.isBuffer(e10) ? new G(`Buffer.alloc(${e10.byteLength})`) : new G(`new Uint8Array(${e10.byteLength})`);
  if (e10 instanceof Date) {
    let r = ln(e10) ? e10.toISOString() : "Invalid Date";
    return new G(`new Date("${r}")`);
  }
  return e10 instanceof Fe ? new G(`Prisma.${e10._getName()}`) : kr(e10) ? new G(`prisma.${Qe(e10.modelName)}.$fields.${e10.name}`) : Array.isArray(e10) ? Ld(e10) : typeof e10 == "object" ? aa(e10) : new G(Object.prototype.toString.call(e10));
}
__name(la, "la");
function Ld(e10) {
  let r = new Ir();
  for (let t of e10) r.addItem(la(t));
  return r;
}
__name(Ld, "Ld");
function Cn(e10, r) {
  let t = r === "pretty" ? Xs : Tn, n = e10.renderAllMessages(t), i = new Ar(0, { colors: t }).write(e10).toString();
  return { message: n, args: i };
}
__name(Cn, "Cn");
function In({ args: e10, errors: r, errorFormat: t, callsite: n, originalMethod: i, clientVersion: o, globalOmit: s }) {
  let a = _r(e10);
  for (let p of r) xn(p, a, s);
  let { message: l, args: u } = Cn(a, t), c = wn({ message: l, callsite: n, originalMethod: i, showColors: t === "pretty", callArguments: u });
  throw new X(c, { clientVersion: o });
}
__name(In, "In");
function Te(e10) {
  return e10.replace(/^./, (r) => r.toLowerCase());
}
__name(Te, "Te");
function ca(e10, r, t) {
  let n = Te(t);
  return !r.result || !(r.result.$allModels || r.result[n]) ? e10 : Fd({ ...e10, ...ua(r.name, e10, r.result.$allModels), ...ua(r.name, e10, r.result[n]) });
}
__name(ca, "ca");
function Fd(e10) {
  let r = new we(), t = /* @__PURE__ */ __name((n, i) => r.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e10[n] ? e10[n].needs.flatMap((o) => t(o, i)) : [n])), "t");
  return on(e10, (n) => ({ ...n, needs: t(n.name, /* @__PURE__ */ new Set()) }));
}
__name(Fd, "Fd");
function ua(e10, r, t) {
  return t ? on(t, ({ needs: n, compute: i }, o) => ({ name: o, needs: n ? Object.keys(n).filter((s) => n[s]) : [], compute: Md(r, o, i) })) : {};
}
__name(ua, "ua");
function Md(e10, r, t) {
  let n = e10?.[r]?.compute;
  return n ? (i) => t({ ...i, [r]: n(i) }) : t;
}
__name(Md, "Md");
function pa(e10, r) {
  if (!r) return e10;
  let t = { ...e10 };
  for (let n of Object.values(r)) if (e10[n.name]) for (let i of n.needs) t[i] = true;
  return t;
}
__name(pa, "pa");
function da(e10, r) {
  if (!r) return e10;
  let t = { ...e10 };
  for (let n of Object.values(r)) if (!e10[n.name]) for (let i of n.needs) delete t[i];
  return t;
}
__name(da, "da");
var Dn = class {
  static {
    __name(this, "Dn");
  }
  constructor(r, t) {
    this.extension = r;
    this.previous = t;
  }
  computedFieldsCache = new we();
  modelExtensionsCache = new we();
  queryCallbacksCache = new we();
  clientExtensions = ot(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
  batchCallbacks = ot(() => {
    let r = this.previous?.getAllBatchQueryCallbacks() ?? [], t = this.extension.query?.$__internalBatch;
    return t ? r.concat(t) : r;
  });
  getAllComputedFields(r) {
    return this.computedFieldsCache.getOrCreate(r, () => ca(this.previous?.getAllComputedFields(r), this.extension, r));
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
var Nr = class e7 {
  static {
    __name(this, "e");
  }
  constructor(r) {
    this.head = r;
  }
  static empty() {
    return new e7();
  }
  static single(r) {
    return new e7(new Dn(r));
  }
  isEmpty() {
    return this.head === void 0;
  }
  append(r) {
    return new e7(new Dn(r, this.head));
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
var On = class {
  static {
    __name(this, "On");
  }
  constructor(r) {
    this.name = r;
  }
};
function ma(e10) {
  return e10 instanceof On;
}
__name(ma, "ma");
var fa = Symbol();
var ft = class {
  static {
    __name(this, "ft");
  }
  constructor(r) {
    if (r !== fa) throw new Error("Skip instance can not be constructed directly");
  }
  ifUndefined(r) {
    return r === void 0 ? Qi : r;
  }
};
var Qi = new ft(fa);
function Se(e10) {
  return e10 instanceof ft;
}
__name(Se, "Se");
var qd = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
var ga = "explicitly `undefined` values are not allowed";
function Ji({ modelName: e10, action: r, args: t, runtimeDataModel: n, extensions: i = Nr.empty(), callsite: o, clientMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: c }) {
  let p = new Wi({ runtimeDataModel: n, modelName: e10, action: r, rootArgs: t, callsite: o, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a, clientVersion: l, previewFeatures: u, globalOmit: c });
  return { modelName: e10, action: qd[r], query: gt(t, p) };
}
__name(Ji, "Ji");
function gt({ select: e10, include: r, ...t } = {}, n) {
  let i = t.omit;
  return delete t.omit, { arguments: ya(t, n), selection: Vd(e10, r, i, n) };
}
__name(gt, "gt");
function Vd(e10, r, t, n) {
  return e10 ? (r ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : t && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), Gd(e10, n)) : jd(n, r, t);
}
__name(Vd, "Vd");
function jd(e10, r, t) {
  let n = {};
  return e10.modelOrType && !e10.isRawAction() && (n.$composites = true, n.$scalars = true), r && Bd(n, r, e10), Ud(n, t, e10), n;
}
__name(jd, "jd");
function Bd(e10, r, t) {
  for (let [n, i] of Object.entries(r)) {
    if (Se(i)) continue;
    let o = t.nestSelection(n);
    if (Ki(i, o), i === false || i === void 0) {
      e10[n] = false;
      continue;
    }
    let s = t.findField(n);
    if (s && s.kind !== "object" && t.throwValidationError({ kind: "IncludeOnScalar", selectionPath: t.getSelectionPath().concat(n), outputType: t.getOutputTypeDescription() }), s) {
      e10[n] = gt(i === true ? {} : i, o);
      continue;
    }
    if (i === true) {
      e10[n] = true;
      continue;
    }
    e10[n] = gt(i, o);
  }
}
__name(Bd, "Bd");
function Ud(e10, r, t) {
  let n = t.getComputedFields(), i = { ...t.getGlobalOmit(), ...r }, o = da(i, n);
  for (let [s, a] of Object.entries(o)) {
    if (Se(a)) continue;
    Ki(a, t.nestSelection(s));
    let l = t.findField(s);
    n?.[s] && !l || (e10[s] = !a);
  }
}
__name(Ud, "Ud");
function Gd(e10, r) {
  let t = {}, n = r.getComputedFields(), i = pa(e10, n);
  for (let [o, s] of Object.entries(i)) {
    if (Se(s)) continue;
    let a = r.nestSelection(o);
    Ki(s, a);
    let l = r.findField(o);
    if (!(n?.[o] && !l)) {
      if (s === false || s === void 0 || Se(s)) {
        t[o] = false;
        continue;
      }
      if (s === true) {
        l?.kind === "object" ? t[o] = gt({}, a) : t[o] = true;
        continue;
      }
      t[o] = gt(s, a);
    }
  }
  return t;
}
__name(Gd, "Gd");
function ha(e10, r) {
  if (e10 === null) return null;
  if (typeof e10 == "string" || typeof e10 == "number" || typeof e10 == "boolean") return e10;
  if (typeof e10 == "bigint") return { $type: "BigInt", value: String(e10) };
  if (vr(e10)) {
    if (ln(e10)) return { $type: "DateTime", value: e10.toISOString() };
    r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r.getSelectionPath(), argumentPath: r.getArgumentPath(), argument: { name: r.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
  }
  if (ma(e10)) return { $type: "Param", value: e10.name };
  if (kr(e10)) return { $type: "FieldRef", value: { _ref: e10.name, _container: e10.modelName } };
  if (Array.isArray(e10)) return Qd(e10, r);
  if (ArrayBuffer.isView(e10)) {
    let { buffer: t, byteOffset: n, byteLength: i } = e10;
    return { $type: "Bytes", value: Buffer.from(t, n, i).toString("base64") };
  }
  if (Wd(e10)) return e10.values;
  if (Sr(e10)) return { $type: "Decimal", value: e10.toFixed() };
  if (e10 instanceof Fe) {
    if (e10 !== Bi.instances[e10._getName()]) throw new Error("Invalid ObjectEnumValue");
    return { $type: "Enum", value: e10._getName() };
  }
  if (Jd(e10)) return e10.toJSON();
  if (typeof e10 == "object") return ya(e10, r);
  r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: r.getSelectionPath(), argumentPath: r.getArgumentPath(), argument: { name: r.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e10)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
}
__name(ha, "ha");
function ya(e10, r) {
  if (e10.$type) return { $type: "Raw", value: e10 };
  let t = {};
  for (let n in e10) {
    let i = e10[n], o = r.nestArgument(n);
    Se(i) || (i !== void 0 ? t[n] = ha(i, o) : r.isPreviewFeatureOn("strictUndefinedChecks") && r.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o.getArgumentPath(), selectionPath: r.getSelectionPath(), argument: { name: r.getArgumentName(), typeNames: [] }, underlyingError: ga }));
  }
  return t;
}
__name(ya, "ya");
function Qd(e10, r) {
  let t = [];
  for (let n = 0; n < e10.length; n++) {
    let i = r.nestArgument(String(n)), o = e10[n];
    if (o === void 0 || Se(o)) {
      let s = o === void 0 ? "undefined" : "Prisma.skip";
      r.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${r.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
    }
    t.push(ha(o, i));
  }
  return t;
}
__name(Qd, "Qd");
function Wd(e10) {
  return typeof e10 == "object" && e10 !== null && e10.__prismaRawParameters__ === true;
}
__name(Wd, "Wd");
function Jd(e10) {
  return typeof e10 == "object" && e10 !== null && typeof e10.toJSON == "function";
}
__name(Jd, "Jd");
function Ki(e10, r) {
  e10 === void 0 && r.isPreviewFeatureOn("strictUndefinedChecks") && r.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: r.getSelectionPath(), underlyingError: ga });
}
__name(Ki, "Ki");
var Wi = class e8 {
  static {
    __name(this, "e");
  }
  constructor(r) {
    this.params = r;
    this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
  }
  modelOrType;
  throwValidationError(r) {
    In({ errors: [r], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
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
    return new e8({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(r) });
  }
  getGlobalOmit() {
    return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[Qe(this.params.modelName)] ?? {} : {};
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
        sr(this.params.action, "Unknown action");
    }
  }
  nestArgument(r) {
    return new e8({ ...this.params, argumentPath: this.params.argumentPath.concat(r) });
  }
};
function ba(e10) {
  if (!e10._hasPreviewFlag("metrics")) throw new X("`metrics` preview feature must be enabled in order to access metrics API", { clientVersion: e10._clientVersion });
}
__name(ba, "ba");
var ht = class {
  static {
    __name(this, "ht");
  }
  _client;
  constructor(r) {
    this._client = r;
  }
  prometheus(r) {
    return ba(this._client), this._client._engine.metrics({ format: "prometheus", ...r });
  }
  json(r) {
    return ba(this._client), this._client._engine.metrics({ format: "json", ...r });
  }
};
var Yi = /* @__PURE__ */ new WeakMap();
var kn = "$$PrismaTypedSql";
var yt = class {
  static {
    __name(this, "yt");
  }
  constructor(r, t) {
    Yi.set(this, { sql: r, values: t }), Object.defineProperty(this, kn, { value: kn });
  }
  get sql() {
    return Yi.get(this).sql;
  }
  get values() {
    return Yi.get(this).values;
  }
};
function _n(e10) {
  return e10 != null && e10[kn] === kn;
}
__name(_n, "_n");
var Zl = le(gi());
var se = class e9 {
  static {
    __name(this, "e");
  }
  constructor(r, t) {
    if (r.length - 1 !== t.length) throw r.length === 0 ? new TypeError("Expected at least 1 string") : new TypeError(`Expected ${r.length} strings to have ${r.length - 1} values`);
    let n = t.reduce((s, a) => s + (a instanceof e9 ? a.values.length : 1), 0);
    this.values = new Array(n), this.strings = new Array(n + 1), this.strings[0] = r[0];
    let i = 0, o = 0;
    for (; i < t.length; ) {
      let s = t[i++], a = r[i];
      if (s instanceof e9) {
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
function Ea(e10) {
  return new se([e10], []);
}
__name(Ea, "Ea");
var Zd = Ea("");
function bt(e10) {
  return { getKeys() {
    return Object.keys(e10);
  }, getPropertyValue(r) {
    return e10[r];
  } };
}
__name(bt, "bt");
function ee(e10, r) {
  return { getKeys() {
    return [e10];
  }, getPropertyValue() {
    return r();
  } };
}
__name(ee, "ee");
function ar(e10) {
  let r = new we();
  return { getKeys() {
    return e10.getKeys();
  }, getPropertyValue(t) {
    return r.getOrCreate(t, () => e10.getPropertyValue(t));
  }, getPropertyDescriptor(t) {
    return e10.getPropertyDescriptor?.(t);
  } };
}
__name(ar, "ar");
var Nn = { enumerable: true, configurable: true, writable: true };
function Ln(e10) {
  let r = new Set(e10);
  return { getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf"), getOwnPropertyDescriptor: /* @__PURE__ */ __name(() => Nn, "getOwnPropertyDescriptor"), has: /* @__PURE__ */ __name((t, n) => r.has(n), "has"), set: /* @__PURE__ */ __name((t, n, i) => r.add(n) && Reflect.set(t, n, i), "set"), ownKeys: /* @__PURE__ */ __name(() => [...r], "ownKeys") };
}
__name(Ln, "Ln");
var xa = Symbol.for("nodejs.util.inspect.custom");
function he(e10, r) {
  let t = Xd(r), n = /* @__PURE__ */ new Set(), i = new Proxy(e10, { get(o, s) {
    if (n.has(s)) return o[s];
    let a = t.get(s);
    return a ? a.getPropertyValue(s) : o[s];
  }, has(o, s) {
    if (n.has(s)) return true;
    let a = t.get(s);
    return a ? a.has?.(s) ?? true : Reflect.has(o, s);
  }, ownKeys(o) {
    let s = va(Reflect.ownKeys(o), t), a = va(Array.from(t.keys()), t);
    return [.../* @__PURE__ */ new Set([...s, ...a, ...n])];
  }, set(o, s, a) {
    return t.get(s)?.getPropertyDescriptor?.(s)?.writable === false ? false : (n.add(s), Reflect.set(o, s, a));
  }, getOwnPropertyDescriptor(o, s) {
    let a = Reflect.getOwnPropertyDescriptor(o, s);
    if (a && !a.configurable) return a;
    let l = t.get(s);
    return l ? l.getPropertyDescriptor ? { ...Nn, ...l?.getPropertyDescriptor(s) } : Nn : a;
  }, defineProperty(o, s, a) {
    return n.add(s), Reflect.defineProperty(o, s, a);
  }, getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf") });
  return i[xa] = function() {
    let o = { ...this };
    return delete o[xa], o;
  }, i;
}
__name(he, "he");
function Xd(e10) {
  let r = /* @__PURE__ */ new Map();
  for (let t of e10) {
    let n = t.getKeys();
    for (let i of n) r.set(i, t);
  }
  return r;
}
__name(Xd, "Xd");
function va(e10, r) {
  return e10.filter((t) => r.get(t)?.has?.(t) ?? true);
}
__name(va, "va");
function Lr(e10) {
  return { getKeys() {
    return e10;
  }, has() {
    return false;
  }, getPropertyValue() {
  } };
}
__name(Lr, "Lr");
function Fr(e10, r) {
  return { batch: e10, transaction: r?.kind === "batch" ? { isolationLevel: r.options.isolationLevel } : void 0 };
}
__name(Fr, "Fr");
function Pa(e10) {
  if (e10 === void 0) return "";
  let r = _r(e10);
  return new Ar(0, { colors: Tn }).write(r).toString();
}
__name(Pa, "Pa");
var em = "P2037";
function Mr({ error: e10, user_facing_error: r }, t, n) {
  return r.error_code ? new Z(rm(r, n), { code: r.error_code, clientVersion: t, meta: r.meta, batchRequestIdx: r.batch_request_idx }) : new q(e10, { clientVersion: t, batchRequestIdx: r.batch_request_idx });
}
__name(Mr, "Mr");
function rm(e10, r) {
  let t = e10.message;
  return (r === "postgresql" || r === "postgres" || r === "mysql") && e10.error_code === em && (t += `
Prisma Accelerate has built-in connection pooling to prevent such errors: https://pris.ly/client/error-accelerate`), t;
}
__name(rm, "rm");
var Et = "<unknown>";
function Ta(e10) {
  var r = e10.split(`
`);
  return r.reduce(function(t, n) {
    var i = im(n) || sm(n) || um(n) || mm(n) || pm(n);
    return i && t.push(i), t;
  }, []);
}
__name(Ta, "Ta");
var tm = /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|rsc|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
var nm = /\((\S*)(?::(\d+))(?::(\d+))\)/;
function im(e10) {
  var r = tm.exec(e10);
  if (!r) return null;
  var t = r[2] && r[2].indexOf("native") === 0, n = r[2] && r[2].indexOf("eval") === 0, i = nm.exec(r[2]);
  return n && i != null && (r[2] = i[1], r[3] = i[2], r[4] = i[3]), { file: t ? null : r[2], methodName: r[1] || Et, arguments: t ? [r[2]] : [], lineNumber: r[3] ? +r[3] : null, column: r[4] ? +r[4] : null };
}
__name(im, "im");
var om = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|rsc|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function sm(e10) {
  var r = om.exec(e10);
  return r ? { file: r[2], methodName: r[1] || Et, arguments: [], lineNumber: +r[3], column: r[4] ? +r[4] : null } : null;
}
__name(sm, "sm");
var am = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|rsc|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i;
var lm = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
function um(e10) {
  var r = am.exec(e10);
  if (!r) return null;
  var t = r[3] && r[3].indexOf(" > eval") > -1, n = lm.exec(r[3]);
  return t && n != null && (r[3] = n[1], r[4] = n[2], r[5] = null), { file: r[3], methodName: r[1] || Et, arguments: r[2] ? r[2].split(",") : [], lineNumber: r[4] ? +r[4] : null, column: r[5] ? +r[5] : null };
}
__name(um, "um");
var cm = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i;
function pm(e10) {
  var r = cm.exec(e10);
  return r ? { file: r[3], methodName: r[1] || Et, arguments: [], lineNumber: +r[4], column: r[5] ? +r[5] : null } : null;
}
__name(pm, "pm");
var dm = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i;
function mm(e10) {
  var r = dm.exec(e10);
  return r ? { file: r[2], methodName: r[1] || Et, arguments: [], lineNumber: +r[3], column: r[4] ? +r[4] : null } : null;
}
__name(mm, "mm");
var zi = class {
  static {
    __name(this, "zi");
  }
  getLocation() {
    return null;
  }
};
var Zi = class {
  static {
    __name(this, "Zi");
  }
  _error;
  constructor() {
    this._error = new Error();
  }
  getLocation() {
    let r = this._error.stack;
    if (!r) return null;
    let n = Ta(r).find((i) => {
      if (!i.file) return false;
      let o = Si(i.file);
      return o !== "<anonymous>" && !o.includes("@prisma") && !o.includes("/packages/client/src/runtime/") && !o.endsWith("/runtime/binary.js") && !o.endsWith("/runtime/library.js") && !o.endsWith("/runtime/edge.js") && !o.endsWith("/runtime/edge-esm.js") && !o.startsWith("internal/") && !i.methodName.includes("new ") && !i.methodName.includes("getCallSite") && !i.methodName.includes("Proxy.") && i.methodName.split(".").length < 4;
    });
    return !n || !n.file ? null : { fileName: n.file, lineNumber: n.lineNumber, columnNumber: n.column };
  }
};
function Ze(e10) {
  return e10 === "minimal" ? typeof $EnabledCallSite == "function" && e10 !== "minimal" ? new $EnabledCallSite() : new zi() : new Zi();
}
__name(Ze, "Ze");
var Sa = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
function $r(e10 = {}) {
  let r = gm(e10);
  return Object.entries(r).reduce((n, [i, o]) => (Sa[i] !== void 0 ? n.select[i] = { select: o } : n[i] = o, n), { select: {} });
}
__name($r, "$r");
function gm(e10 = {}) {
  return typeof e10._count == "boolean" ? { ...e10, _count: { _all: e10._count } } : e10;
}
__name(gm, "gm");
function Fn(e10 = {}) {
  return (r) => (typeof e10._count == "boolean" && (r._count = r._count._all), r);
}
__name(Fn, "Fn");
function Ra(e10, r) {
  let t = Fn(e10);
  return r({ action: "aggregate", unpacker: t, argsMapper: $r })(e10);
}
__name(Ra, "Ra");
function hm(e10 = {}) {
  let { select: r, ...t } = e10;
  return typeof r == "object" ? $r({ ...t, _count: r }) : $r({ ...t, _count: { _all: true } });
}
__name(hm, "hm");
function ym(e10 = {}) {
  return typeof e10.select == "object" ? (r) => Fn(e10)(r)._count : (r) => Fn(e10)(r)._count._all;
}
__name(ym, "ym");
function Aa(e10, r) {
  return r({ action: "count", unpacker: ym(e10), argsMapper: hm })(e10);
}
__name(Aa, "Aa");
function bm(e10 = {}) {
  let r = $r(e10);
  if (Array.isArray(r.by)) for (let t of r.by) typeof t == "string" && (r.select[t] = true);
  else typeof r.by == "string" && (r.select[r.by] = true);
  return r;
}
__name(bm, "bm");
function Em(e10 = {}) {
  return (r) => (typeof e10?._count == "boolean" && r.forEach((t) => {
    t._count = t._count._all;
  }), r);
}
__name(Em, "Em");
function Ca(e10, r) {
  return r({ action: "groupBy", unpacker: Em(e10), argsMapper: bm })(e10);
}
__name(Ca, "Ca");
function Ia(e10, r, t) {
  if (r === "aggregate") return (n) => Ra(n, t);
  if (r === "count") return (n) => Aa(n, t);
  if (r === "groupBy") return (n) => Ca(n, t);
}
__name(Ia, "Ia");
function Da(e10, r) {
  let t = r.fields.filter((i) => !i.relationName), n = As(t, "name");
  return new Proxy({}, { get(i, o) {
    if (o in i || typeof o == "symbol") return i[o];
    let s = n[o];
    if (s) return new ut(e10, o, s.type, s.isList, s.kind === "enum");
  }, ...Ln(Object.keys(n)) });
}
__name(Da, "Da");
var Oa = /* @__PURE__ */ __name((e10) => Array.isArray(e10) ? e10 : e10.split("."), "Oa");
var Xi = /* @__PURE__ */ __name((e10, r) => Oa(r).reduce((t, n) => t && t[n], e10), "Xi");
var ka = /* @__PURE__ */ __name((e10, r, t) => Oa(r).reduceRight((n, i, o, s) => Object.assign({}, Xi(e10, s.slice(0, o)), { [i]: n }), t), "ka");
function wm(e10, r) {
  return e10 === void 0 || r === void 0 ? [] : [...r, "select", e10];
}
__name(wm, "wm");
function xm(e10, r, t) {
  return r === void 0 ? e10 ?? {} : ka(r, t, e10 || true);
}
__name(xm, "xm");
function eo(e10, r, t, n, i, o) {
  let a = e10._runtimeDataModel.models[r].fields.reduce((l, u) => ({ ...l, [u.name]: u }), {});
  return (l) => {
    let u = Ze(e10._errorFormat), c = wm(n, i), p = xm(l, o, c), d = t({ dataPath: c, callsite: u })(p), f = vm(e10, r);
    return new Proxy(d, { get(h, g) {
      if (!f.includes(g)) return h[g];
      let T = [a[g].type, t, g], S = [c, p];
      return eo(e10, ...T, ...S);
    }, ...Ln([...f, ...Object.getOwnPropertyNames(d)]) });
  };
}
__name(eo, "eo");
function vm(e10, r) {
  return e10._runtimeDataModel.models[r].fields.filter((t) => t.kind === "object").map((t) => t.name);
}
__name(vm, "vm");
var Pm = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
var Tm = ["aggregate", "count", "groupBy"];
function ro(e10, r) {
  let t = e10._extensions.getAllModelExtensions(r) ?? {}, n = [Sm(e10, r), Am(e10, r), bt(t), ee("name", () => r), ee("$name", () => r), ee("$parent", () => e10._appliedParent)];
  return he({}, n);
}
__name(ro, "ro");
function Sm(e10, r) {
  let t = Te(r), n = Object.keys(Rr).concat("count");
  return { getKeys() {
    return n;
  }, getPropertyValue(i) {
    let o = i, s = /* @__PURE__ */ __name((a) => (l) => {
      let u = Ze(e10._errorFormat);
      return e10._createPrismaPromise((c) => {
        let p = { args: l, dataPath: [], action: o, model: r, clientMethod: `${t}.${i}`, jsModelName: t, transaction: c, callsite: u };
        return e10._request({ ...p, ...a });
      }, { action: o, args: l, model: r });
    }, "s");
    return Pm.includes(o) ? eo(e10, r, s) : Rm(i) ? Ia(e10, i, s) : s({});
  } };
}
__name(Sm, "Sm");
function Rm(e10) {
  return Tm.includes(e10);
}
__name(Rm, "Rm");
function Am(e10, r) {
  return ar(ee("fields", () => {
    let t = e10._runtimeDataModel.models[r];
    return Da(r, t);
  }));
}
__name(Am, "Am");
function _a(e10) {
  return e10.replace(/^./, (r) => r.toUpperCase());
}
__name(_a, "_a");
var to = Symbol();
function wt(e10) {
  let r = [Cm(e10), Im(e10), ee(to, () => e10), ee("$parent", () => e10._appliedParent)], t = e10._extensions.getAllClientExtensions();
  return t && r.push(bt(t)), he(e10, r);
}
__name(wt, "wt");
function Cm(e10) {
  let r = Object.getPrototypeOf(e10._originalClient), t = [...new Set(Object.getOwnPropertyNames(r))];
  return { getKeys() {
    return t;
  }, getPropertyValue(n) {
    return e10[n];
  } };
}
__name(Cm, "Cm");
function Im(e10) {
  let r = Object.keys(e10._runtimeDataModel.models), t = r.map(Te), n = [...new Set(r.concat(t))];
  return ar({ getKeys() {
    return n;
  }, getPropertyValue(i) {
    let o = _a(i);
    if (e10._runtimeDataModel.models[o] !== void 0) return ro(e10, o);
    if (e10._runtimeDataModel.models[i] !== void 0) return ro(e10, i);
  }, getPropertyDescriptor(i) {
    if (!t.includes(i)) return { enumerable: false };
  } });
}
__name(Im, "Im");
function Na(e10) {
  return e10[to] ? e10[to] : e10;
}
__name(Na, "Na");
function La(e10) {
  if (typeof e10 == "function") return e10(this);
  if (e10.client?.__AccelerateEngine) {
    let t = e10.client.__AccelerateEngine;
    this._originalClient._engine = new t(this._originalClient._accelerateEngineConfig);
  }
  let r = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e10) }, _appliedParent: { value: this, configurable: true }, $on: { value: void 0 } });
  return wt(r);
}
__name(La, "La");
function Fa({ result: e10, modelName: r, select: t, omit: n, extensions: i }) {
  let o = i.getAllComputedFields(r);
  if (!o) return e10;
  let s = [], a = [];
  for (let l of Object.values(o)) {
    if (n) {
      if (n[l.name]) continue;
      let u = l.needs.filter((c) => n[c]);
      u.length > 0 && a.push(Lr(u));
    } else if (t) {
      if (!t[l.name]) continue;
      let u = l.needs.filter((c) => !t[c]);
      u.length > 0 && a.push(Lr(u));
    }
    Dm(e10, l.needs) && s.push(Om(l, he(e10, s)));
  }
  return s.length > 0 || a.length > 0 ? he(e10, [...s, ...a]) : e10;
}
__name(Fa, "Fa");
function Dm(e10, r) {
  return r.every((t) => Oi(e10, t));
}
__name(Dm, "Dm");
function Om(e10, r) {
  return ar(ee(e10.name, () => e10.compute(r)));
}
__name(Om, "Om");
function Mn({ visitor: e10, result: r, args: t, runtimeDataModel: n, modelName: i }) {
  if (Array.isArray(r)) {
    for (let s = 0; s < r.length; s++) r[s] = Mn({ result: r[s], args: t, modelName: i, runtimeDataModel: n, visitor: e10 });
    return r;
  }
  let o = e10(r, i, t) ?? r;
  return t.include && Ma({ includeOrSelect: t.include, result: o, parentModelName: i, runtimeDataModel: n, visitor: e10 }), t.select && Ma({ includeOrSelect: t.select, result: o, parentModelName: i, runtimeDataModel: n, visitor: e10 }), o;
}
__name(Mn, "Mn");
function Ma({ includeOrSelect: e10, result: r, parentModelName: t, runtimeDataModel: n, visitor: i }) {
  for (let [o, s] of Object.entries(e10)) {
    if (!s || r[o] == null || Se(s)) continue;
    let l = n.models[t].fields.find((c) => c.name === o);
    if (!l || l.kind !== "object" || !l.relationName) continue;
    let u = typeof s == "object" ? s : {};
    r[o] = Mn({ visitor: i, result: r[o], args: u, modelName: l.type, runtimeDataModel: n });
  }
}
__name(Ma, "Ma");
function $a({ result: e10, modelName: r, args: t, extensions: n, runtimeDataModel: i, globalOmit: o }) {
  return n.isEmpty() || e10 == null || typeof e10 != "object" || !i.models[r] ? e10 : Mn({ result: e10, args: t ?? {}, modelName: r, runtimeDataModel: i, visitor: /* @__PURE__ */ __name((a, l, u) => {
    let c = Te(l);
    return Fa({ result: a, modelName: c, select: u.select, omit: u.select ? void 0 : { ...o?.[c], ...u.omit }, extensions: n });
  }, "visitor") });
}
__name($a, "$a");
var km = ["$connect", "$disconnect", "$on", "$transaction", "$extends"];
var qa = km;
function Va(e10) {
  if (e10 instanceof se) return _m(e10);
  if (_n(e10)) return Nm(e10);
  if (Array.isArray(e10)) {
    let t = [e10[0]];
    for (let n = 1; n < e10.length; n++) t[n] = xt(e10[n]);
    return t;
  }
  let r = {};
  for (let t in e10) r[t] = xt(e10[t]);
  return r;
}
__name(Va, "Va");
function _m(e10) {
  return new se(e10.strings, e10.values);
}
__name(_m, "_m");
function Nm(e10) {
  return new yt(e10.sql, e10.values);
}
__name(Nm, "Nm");
function xt(e10) {
  if (typeof e10 != "object" || e10 == null || e10 instanceof Fe || kr(e10)) return e10;
  if (Sr(e10)) return new Ye(e10.toFixed());
  if (vr(e10)) return /* @__PURE__ */ new Date(+e10);
  if (ArrayBuffer.isView(e10)) return e10.slice(0);
  if (Array.isArray(e10)) {
    let r = e10.length, t;
    for (t = Array(r); r--; ) t[r] = xt(e10[r]);
    return t;
  }
  if (typeof e10 == "object") {
    let r = {};
    for (let t in e10) t === "__proto__" ? Object.defineProperty(r, t, { value: xt(e10[t]), configurable: true, enumerable: true, writable: true }) : r[t] = xt(e10[t]);
    return r;
  }
  sr(e10, "Unknown value");
}
__name(xt, "xt");
function Ba(e10, r, t, n = 0) {
  return e10._createPrismaPromise((i) => {
    let o = r.customDataProxyFetch;
    return "transaction" in r && i !== void 0 && (r.transaction?.kind === "batch" && r.transaction.lock.then(), r.transaction = i), n === t.length ? e10._executeRequest(r) : t[n]({ model: r.model, operation: r.model ? r.action : r.clientMethod, args: Va(r.args ?? {}), __internalParams: r, query: /* @__PURE__ */ __name((s, a = r) => {
      let l = a.customDataProxyFetch;
      return a.customDataProxyFetch = Wa(o, l), a.args = s, Ba(e10, a, t, n + 1);
    }, "query") });
  });
}
__name(Ba, "Ba");
function Ua(e10, r) {
  let { jsModelName: t, action: n, clientMethod: i } = r, o = t ? n : i;
  if (e10._extensions.isEmpty()) return e10._executeRequest(r);
  let s = e10._extensions.getAllQueryCallbacks(t ?? "$none", o);
  return Ba(e10, r, s);
}
__name(Ua, "Ua");
function Ga(e10) {
  return (r) => {
    let t = { requests: r }, n = r[0].extensions.getAllBatchQueryCallbacks();
    return n.length ? Qa(t, n, 0, e10) : e10(t);
  };
}
__name(Ga, "Ga");
function Qa(e10, r, t, n) {
  if (t === r.length) return n(e10);
  let i = e10.customDataProxyFetch, o = e10.requests[0].transaction;
  return r[t]({ args: { queries: e10.requests.map((s) => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o ? { isolationLevel: o.kind === "batch" ? o.isolationLevel : void 0 } : void 0 }, __internalParams: e10, query(s, a = e10) {
    let l = a.customDataProxyFetch;
    return a.customDataProxyFetch = Wa(i, l), Qa(a, r, t + 1, n);
  } });
}
__name(Qa, "Qa");
var ja = /* @__PURE__ */ __name((e10) => e10, "ja");
function Wa(e10 = ja, r = ja) {
  return (t) => e10(r(t));
}
__name(Wa, "Wa");
var Ja = L("prisma:client");
var Ka = { Vercel: "vercel", "Netlify CI": "netlify" };
function Ha({ postinstall: e10, ciName: r, clientVersion: t, generator: n }) {
  if (Ja("checkPlatformCaching:postinstall", e10), Ja("checkPlatformCaching:ciName", r), e10 === true && !(n?.output && typeof (n.output.fromEnvVar ?? n.output.value) == "string") && r && r in Ka) {
    let i = `Prisma has detected that this project was built on ${r}, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the \`prisma generate\` command during the build process.

Learn how: https://pris.ly/d/${Ka[r]}-build`;
    throw console.error(i), new P(i, t);
  }
}
__name(Ha, "Ha");
function Ya(e10, r) {
  return e10 ? e10.datasources ? e10.datasources : e10.datasourceUrl ? { [r[0]]: { url: e10.datasourceUrl } } : {} : {};
}
__name(Ya, "Ya");
function $n(e10) {
  let { runtimeBinaryTarget: r } = e10;
  return `Add "${r}" to \`binaryTargets\` in the "schema.prisma" file and run \`prisma generate\` after saving it:

${Lm(e10)}`;
}
__name($n, "$n");
function Lm(e10) {
  let { generator: r, generatorBinaryTargets: t, runtimeBinaryTarget: n } = e10, i = { fromEnvVar: null, value: n }, o = [...t, i];
  return vi({ ...r, binaryTargets: o });
}
__name(Lm, "Lm");
function Xe(e10) {
  let { runtimeBinaryTarget: r } = e10;
  return `Prisma Client could not locate the Query Engine for runtime "${r}".`;
}
__name(Xe, "Xe");
function er(e10) {
  let { searchedLocations: r } = e10;
  return `The following locations have been searched:
${[...new Set(r)].map((i) => `  ${i}`).join(`
`)}`;
}
__name(er, "er");
function za(e10) {
  let { runtimeBinaryTarget: r } = e10;
  return `${Xe(e10)}

This happened because \`binaryTargets\` have been pinned, but the actual deployment also required "${r}".
${$n(e10)}

${er(e10)}`;
}
__name(za, "za");
function qn(e10) {
  return `We would appreciate if you could take the time to share some information with us.
Please help us by answering a few questions: https://pris.ly/${e10}`;
}
__name(qn, "qn");
function Vn(e10) {
  let { errorStack: r } = e10;
  return r?.match(/\/\.next|\/next@|\/next\//) ? `

We detected that you are using Next.js, learn how to fix this: https://pris.ly/d/engine-not-found-nextjs.` : "";
}
__name(Vn, "Vn");
function Za(e10) {
  let { queryEngineName: r } = e10;
  return `${Xe(e10)}${Vn(e10)}

This is likely caused by a bundler that has not copied "${r}" next to the resulting bundle.
Ensure that "${r}" has been copied next to the bundle or in "${e10.expectedLocation}".

${qn("engine-not-found-bundler-investigation")}

${er(e10)}`;
}
__name(Za, "Za");
function Xa(e10) {
  let { runtimeBinaryTarget: r, generatorBinaryTargets: t } = e10, n = t.find((i) => i.native);
  return `${Xe(e10)}

This happened because Prisma Client was generated for "${n?.value ?? "unknown"}", but the actual deployment required "${r}".
${$n(e10)}

${er(e10)}`;
}
__name(Xa, "Xa");
function el(e10) {
  let { queryEngineName: r } = e10;
  return `${Xe(e10)}${Vn(e10)}

This is likely caused by tooling that has not copied "${r}" to the deployment folder.
Ensure that you ran \`prisma generate\` and that "${r}" has been copied to "${e10.expectedLocation}".

${qn("engine-not-found-tooling-investigation")}

${er(e10)}`;
}
__name(el, "el");
var Mm = L("prisma:client:engines:resolveEnginePath");
var $m = /* @__PURE__ */ __name(() => new RegExp("runtime[\\\\/]library\\.m?js$"), "$m");
async function rl(e10, r) {
  let t = { binary: process2.env.PRISMA_QUERY_ENGINE_BINARY, library: process2.env.PRISMA_QUERY_ENGINE_LIBRARY }[e10] ?? r.prismaPath;
  if (t !== void 0) return t;
  let { enginePath: n, searchedLocations: i } = await qm(e10, r);
  if (Mm("enginePath", n), n !== void 0 && e10 === "binary" && hi(n), n !== void 0) return r.prismaPath = n;
  let o = await nr(), s = r.generator?.binaryTargets ?? [], a = s.some((d) => d.native), l = !s.some((d) => d.value === o), u = __filename.match($m()) === null, c = { searchedLocations: i, generatorBinaryTargets: s, generator: r.generator, runtimeBinaryTarget: o, queryEngineName: tl(e10, o), expectedLocation: jn.relative(process2.cwd(), r.dirname), errorStack: new Error().stack }, p;
  throw a && l ? p = Xa(c) : l ? p = za(c) : u ? p = Za(c) : p = el(c), new P(p, r.clientVersion);
}
__name(rl, "rl");
async function qm(e10, r) {
  let t = await nr(), n = [], i = [r.dirname, jn.resolve(__dirname, ".."), r.generator?.output?.value ?? __dirname, jn.resolve(__dirname, "../../../.prisma/client"), "/tmp/prisma-engines", r.cwd];
  __filename.includes("resolveEnginePath") && i.push(ss());
  for (let o of i) {
    let s = tl(e10, t), a = jn.join(o, s);
    if (n.push(o), Fm.existsSync(a)) return { enginePath: a, searchedLocations: n };
  }
  return { enginePath: void 0, searchedLocations: n };
}
__name(qm, "qm");
function tl(e10, r) {
  return e10 === "library" ? Vt(r, "fs") : `query-engine-${r}${r === "windows" ? ".exe" : ""}`;
}
__name(tl, "tl");
function nl(e10) {
  return e10 ? e10.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (r) => `${r[0]}5`) : "";
}
__name(nl, "nl");
function il(e10) {
  return e10.split(`
`).map((r) => r.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
}
__name(il, "il");
var ol = le(Ss());
function sl({ title: e10, user: r = "prisma", repo: t = "prisma", template: n = "bug_report.yml", body: i }) {
  return (0, ol.default)({ user: r, repo: t, template: n, title: e10, body: i });
}
__name(sl, "sl");
function al({ version: e10, binaryTarget: r, title: t, description: n, engineVersion: i, database: o, query: s }) {
  let a = Mo(6e3 - (s?.length ?? 0)), l = il(xr(a)), u = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", c = xr(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${process2.version?.padEnd(19)}| 
| OS              | ${r?.padEnd(19)}|
| Prisma Client   | ${e10?.padEnd(19)}|
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
${s ? nl(s) : ""}
\`\`\`
`), p = sl({ title: t, body: c });
  return `${t}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${H(p)}

If you want the Prisma team to look into it, please open the link above 🙏
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
}
__name(al, "al");
function ll(e10, r) {
  throw new Error(r);
}
__name(ll, "ll");
function Vm(e10) {
  return e10 !== null && typeof e10 == "object" && typeof e10.$type == "string";
}
__name(Vm, "Vm");
function jm(e10, r) {
  let t = {};
  for (let n of Object.keys(e10)) t[n] = r(e10[n], n);
  return t;
}
__name(jm, "jm");
function vt(e10) {
  return e10 === null ? e10 : Array.isArray(e10) ? e10.map(vt) : typeof e10 == "object" ? Vm(e10) ? Bm(e10) : e10.constructor !== null && e10.constructor.name !== "Object" ? e10 : jm(e10, vt) : e10;
}
__name(vt, "vt");
function Bm({ $type: e10, value: r }) {
  switch (e10) {
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
      ll(r, "Unknown tagged value");
  }
}
__name(Bm, "Bm");
var ul = "6.19.3";
var Gm = /* @__PURE__ */ __name(() => globalThis.process?.release?.name === "node", "Gm");
var Qm = /* @__PURE__ */ __name(() => !!globalThis.Bun || !!globalThis.process?.versions?.bun, "Qm");
var Wm = /* @__PURE__ */ __name(() => !!globalThis.Deno, "Wm");
var Jm = /* @__PURE__ */ __name(() => typeof globalThis.Netlify == "object", "Jm");
var Km = /* @__PURE__ */ __name(() => typeof globalThis.EdgeRuntime == "object", "Km");
var Hm = /* @__PURE__ */ __name(() => globalThis.navigator?.userAgent === "Cloudflare-Workers", "Hm");
function Ym() {
  return [[Jm, "netlify"], [Km, "edge-light"], [Hm, "workerd"], [Wm, "deno"], [Qm, "bun"], [Gm, "node"]].flatMap((t) => t[0]() ? [t[1]] : []).at(0) ?? "";
}
__name(Ym, "Ym");
var zm = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
function no() {
  let e10 = Ym();
  return { id: e10, prettyName: zm[e10] || e10, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e10) };
}
__name(no, "no");
function qr({ inlineDatasources: e10, overrideDatasources: r, env: t, clientVersion: n }) {
  let i, o = Object.keys(e10)[0], s = e10[o]?.url, a = r[o]?.url;
  if (o === void 0 ? i = void 0 : a ? i = a : s?.value ? i = s.value : s?.fromEnvVar && (i = t[s.fromEnvVar]), s?.fromEnvVar !== void 0 && i === void 0) throw new P(`error: Environment variable not found: ${s.fromEnvVar}.`, n);
  if (i === void 0) throw new P("error: Missing URL environment variable, value, or override.", n);
  return i;
}
__name(qr, "qr");
var Bn = class extends Error {
  static {
    __name(this, "Bn");
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
var ne = class extends Bn {
  static {
    __name(this, "ne");
  }
  isRetryable;
  constructor(r, t) {
    super(r, t), this.isRetryable = t.isRetryable ?? true;
  }
};
function R(e10, r) {
  return { ...e10, isRetryable: r };
}
__name(R, "R");
var lr = class extends ne {
  static {
    __name(this, "lr");
  }
  name = "InvalidDatasourceError";
  code = "P6001";
  constructor(r, t) {
    super(r, R(t, false));
  }
};
x(lr, "InvalidDatasourceError");
function cl(e10) {
  let r = { clientVersion: e10.clientVersion }, t = Object.keys(e10.inlineDatasources)[0], n = qr({ inlineDatasources: e10.inlineDatasources, overrideDatasources: e10.overrideDatasources, clientVersion: e10.clientVersion, env: { ...e10.env, ...typeof process2 < "u" ? process2.env : {} } }), i;
  try {
    i = new URL(n);
  } catch {
    throw new lr(`Error validating datasource \`${t}\`: the URL must start with the protocol \`prisma://\``, r);
  }
  let { protocol: o, searchParams: s } = i;
  if (o !== "prisma:" && o !== Xt) throw new lr(`Error validating datasource \`${t}\`: the URL must start with the protocol \`prisma://\` or \`prisma+postgres://\``, r);
  let a = s.get("api_key");
  if (a === null || a.length < 1) throw new lr(`Error validating datasource \`${t}\`: the URL must contain a valid API key`, r);
  let l = Ei(i) ? "http:" : "https:";
  process2.env.TEST_CLIENT_ENGINE_REMOTE_EXECUTOR && i.searchParams.has("use_http") && (l = "http:");
  let u = new URL(i.href.replace(o, l));
  return { apiKey: a, url: u };
}
__name(cl, "cl");
var pl = le(Zt());
var Un = class {
  static {
    __name(this, "Un");
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
    let n = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": pl.enginesVersion };
    this.tracingHelper.isEnabled() && (n.traceparent = r ?? this.tracingHelper.getTraceParent()), t && (n["X-Transaction-Id"] = t);
    let i = this.#e();
    return i.length > 0 && (n["X-Capture-Telemetry"] = i.join(", ")), n;
  }
  #e() {
    let r = [];
    return this.tracingHelper.isEnabled() && r.push("tracing"), this.logLevel && r.push(this.logLevel), this.logQueries && r.push("query"), r;
  }
};
function Zm(e10) {
  return e10[0] * 1e3 + e10[1] / 1e6;
}
__name(Zm, "Zm");
function io(e10) {
  return new Date(Zm(e10));
}
__name(io, "io");
var Vr = class extends ne {
  static {
    __name(this, "Vr");
  }
  name = "ForcedRetryError";
  code = "P5001";
  constructor(r) {
    super("This request must be retried", R(r, true));
  }
};
x(Vr, "ForcedRetryError");
var ur = class extends ne {
  static {
    __name(this, "ur");
  }
  name = "NotImplementedYetError";
  code = "P5004";
  constructor(r, t) {
    super(r, R(t, false));
  }
};
x(ur, "NotImplementedYetError");
var F = class extends ne {
  static {
    __name(this, "F");
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
var cr = class extends F {
  static {
    __name(this, "cr");
  }
  name = "SchemaMissingError";
  code = "P5005";
  constructor(r) {
    super("Schema needs to be uploaded", R(r, true));
  }
};
x(cr, "SchemaMissingError");
var oo = "This request could not be understood by the server";
var Pt = class extends F {
  static {
    __name(this, "Pt");
  }
  name = "BadRequestError";
  code = "P5000";
  constructor(r, t, n) {
    super(t || oo, R(r, false)), n && (this.code = n);
  }
};
x(Pt, "BadRequestError");
var Tt = class extends F {
  static {
    __name(this, "Tt");
  }
  name = "HealthcheckTimeoutError";
  code = "P5013";
  logs;
  constructor(r, t) {
    super("Engine not started: healthcheck timeout", R(r, true)), this.logs = t;
  }
};
x(Tt, "HealthcheckTimeoutError");
var St = class extends F {
  static {
    __name(this, "St");
  }
  name = "EngineStartupError";
  code = "P5014";
  logs;
  constructor(r, t, n) {
    super(t, R(r, true)), this.logs = n;
  }
};
x(St, "EngineStartupError");
var Rt = class extends F {
  static {
    __name(this, "Rt");
  }
  name = "EngineVersionNotSupportedError";
  code = "P5012";
  constructor(r) {
    super("Engine version is not supported", R(r, false));
  }
};
x(Rt, "EngineVersionNotSupportedError");
var so = "Request timed out";
var At = class extends F {
  static {
    __name(this, "At");
  }
  name = "GatewayTimeoutError";
  code = "P5009";
  constructor(r, t = so) {
    super(t, R(r, false));
  }
};
x(At, "GatewayTimeoutError");
var Xm = "Interactive transaction error";
var Ct = class extends F {
  static {
    __name(this, "Ct");
  }
  name = "InteractiveTransactionError";
  code = "P5015";
  constructor(r, t = Xm) {
    super(t, R(r, false));
  }
};
x(Ct, "InteractiveTransactionError");
var ef = "Request parameters are invalid";
var It = class extends F {
  static {
    __name(this, "It");
  }
  name = "InvalidRequestError";
  code = "P5011";
  constructor(r, t = ef) {
    super(t, R(r, false));
  }
};
x(It, "InvalidRequestError");
var ao = "Requested resource does not exist";
var Dt = class extends F {
  static {
    __name(this, "Dt");
  }
  name = "NotFoundError";
  code = "P5003";
  constructor(r, t = ao) {
    super(t, R(r, false));
  }
};
x(Dt, "NotFoundError");
var lo = "Unknown server error";
var jr = class extends F {
  static {
    __name(this, "jr");
  }
  name = "ServerError";
  code = "P5006";
  logs;
  constructor(r, t, n) {
    super(t || lo, R(r, true)), this.logs = n;
  }
};
x(jr, "ServerError");
var uo = "Unauthorized, check your connection string";
var Ot = class extends F {
  static {
    __name(this, "Ot");
  }
  name = "UnauthorizedError";
  code = "P5007";
  constructor(r, t = uo) {
    super(t, R(r, false));
  }
};
x(Ot, "UnauthorizedError");
var co = "Usage exceeded, retry again later";
var kt = class extends F {
  static {
    __name(this, "kt");
  }
  name = "UsageExceededError";
  code = "P5008";
  constructor(r, t = co) {
    super(t, R(r, true));
  }
};
x(kt, "UsageExceededError");
async function rf(e10) {
  let r;
  try {
    r = await e10.text();
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
__name(rf, "rf");
async function _t(e10, r) {
  if (e10.ok) return;
  let t = { clientVersion: r, response: e10 }, n = await rf(e10);
  if (n.type === "QueryEngineError") throw new Z(n.body.message, { code: n.body.error_code, clientVersion: r });
  if (n.type === "DataProxyError") {
    if (n.body === "InternalDataProxyError") throw new jr(t, "Internal Data Proxy error");
    if ("EngineNotStarted" in n.body) {
      if (n.body.EngineNotStarted.reason === "SchemaMissing") return new cr(t);
      if (n.body.EngineNotStarted.reason === "EngineVersionNotSupported") throw new Rt(t);
      if ("EngineStartupError" in n.body.EngineNotStarted.reason) {
        let { msg: i, logs: o } = n.body.EngineNotStarted.reason.EngineStartupError;
        throw new St(t, i, o);
      }
      if ("KnownEngineStartupError" in n.body.EngineNotStarted.reason) {
        let { msg: i, error_code: o } = n.body.EngineNotStarted.reason.KnownEngineStartupError;
        throw new P(i, r, o);
      }
      if ("HealthcheckTimeout" in n.body.EngineNotStarted.reason) {
        let { logs: i } = n.body.EngineNotStarted.reason.HealthcheckTimeout;
        throw new Tt(t, i);
      }
    }
    if ("InteractiveTransactionMisrouted" in n.body) {
      let i = { IDParseError: "Could not parse interactive transaction ID", NoQueryEngineFoundError: "Could not find Query Engine for the specified host and transaction ID", TransactionStartError: "Could not start interactive transaction" };
      throw new Ct(t, i[n.body.InteractiveTransactionMisrouted.reason]);
    }
    if ("InvalidRequestError" in n.body) throw new It(t, n.body.InvalidRequestError.reason);
  }
  if (e10.status === 401 || e10.status === 403) throw new Ot(t, Br(uo, n));
  if (e10.status === 404) return new Dt(t, Br(ao, n));
  if (e10.status === 429) throw new kt(t, Br(co, n));
  if (e10.status === 504) throw new At(t, Br(so, n));
  if (e10.status >= 500) throw new jr(t, Br(lo, n));
  if (e10.status >= 400) throw new Pt(t, Br(oo, n));
}
__name(_t, "_t");
function Br(e10, r) {
  return r.type === "EmptyError" ? e10 : `${e10}: ${JSON.stringify(r)}`;
}
__name(Br, "Br");
function dl(e10) {
  let r = Math.pow(2, e10) * 50, t = Math.ceil(Math.random() * r) - Math.ceil(r / 2), n = r + t;
  return new Promise((i) => setTimeout(() => i(n), n));
}
__name(dl, "dl");
var Me = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function ml(e10) {
  let r = new TextEncoder().encode(e10), t = "", n = r.byteLength, i = n % 3, o = n - i, s, a, l, u, c;
  for (let p = 0; p < o; p = p + 3) c = r[p] << 16 | r[p + 1] << 8 | r[p + 2], s = (c & 16515072) >> 18, a = (c & 258048) >> 12, l = (c & 4032) >> 6, u = c & 63, t += Me[s] + Me[a] + Me[l] + Me[u];
  return i == 1 ? (c = r[o], s = (c & 252) >> 2, a = (c & 3) << 4, t += Me[s] + Me[a] + "==") : i == 2 && (c = r[o] << 8 | r[o + 1], s = (c & 64512) >> 10, a = (c & 1008) >> 4, l = (c & 15) << 2, t += Me[s] + Me[a] + Me[l] + "="), t;
}
__name(ml, "ml");
function fl(e10) {
  if (!!e10.generator?.previewFeatures.some((t) => t.toLowerCase().includes("metrics"))) throw new P("The `metrics` preview feature is not yet available with Accelerate.\nPlease remove `metrics` from the `previewFeatures` in your schema.\n\nMore information about Accelerate: https://pris.ly/d/accelerate", e10.clientVersion);
}
__name(fl, "fl");
var gl = { "@prisma/debug": "workspace:*", "@prisma/engines-version": "7.1.1-3.c2990dca591cba766e3b7ef5d9e8a84796e47ab7", "@prisma/fetch-engine": "workspace:*", "@prisma/get-platform": "workspace:*" };
var Nt = class extends ne {
  static {
    __name(this, "Nt");
  }
  name = "RequestError";
  code = "P5010";
  constructor(r, t) {
    super(`Cannot fetch data from service:
${r}`, R(t, true));
  }
};
x(Nt, "RequestError");
async function pr(e10, r, t = (n) => n) {
  let { clientVersion: n, ...i } = r, o = t(fetch);
  try {
    return await o(e10, i);
  } catch (s) {
    let a = s.message ?? "Unknown error";
    throw new Nt(a, { clientVersion: n, cause: s });
  }
}
__name(pr, "pr");
var nf = /^[1-9][0-9]*\.[0-9]+\.[0-9]+$/;
var hl = L("prisma:client:dataproxyEngine");
async function of(e10, r) {
  let t = gl["@prisma/engines-version"], n = r.clientVersion ?? "unknown";
  if (process2.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION) return process2.env.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION || globalThis.PRISMA_CLIENT_DATA_PROXY_CLIENT_VERSION;
  if (e10.includes("accelerate") && n !== "0.0.0" && n !== "in-memory") return n;
  let [i, o] = n?.split("-") ?? [];
  if (o === void 0 && nf.test(i)) return i;
  if (o !== void 0 || n === "0.0.0" || n === "in-memory") {
    let [s] = t.split("-") ?? [], [a, l, u] = s.split("."), c = sf(`<=${a}.${l}.${u}`), p = await pr(c, { clientVersion: n });
    if (!p.ok) throw new Error(`Failed to fetch stable Prisma version, unpkg.com status ${p.status} ${p.statusText}, response body: ${await p.text() || "<empty body>"}`);
    let d = await p.text();
    hl("length of body fetched from unpkg.com", d.length);
    let f;
    try {
      f = JSON.parse(d);
    } catch (h) {
      throw console.error("JSON.parse error: body fetched from unpkg.com: ", d), h;
    }
    return f.version;
  }
  throw new ur("Only `major.minor.patch` versions are supported by Accelerate.", { clientVersion: n });
}
__name(of, "of");
async function yl(e10, r) {
  let t = await of(e10, r);
  return hl("version", t), t;
}
__name(yl, "yl");
function sf(e10) {
  return encodeURI(`https://unpkg.com/prisma@${e10}/package.json`);
}
__name(sf, "sf");
var bl = 3;
var Lt = L("prisma:client:dataproxyEngine");
var Ft = class {
  static {
    __name(this, "Ft");
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
    fl(r), this.config = r, this.env = r.env, this.inlineSchema = ml(r.inlineSchema), this.inlineDatasources = r.inlineDatasources, this.inlineSchemaHash = r.inlineSchemaHash, this.clientVersion = r.clientVersion, this.engineHash = r.engineVersion, this.logEmitter = r.logEmitter, this.tracingHelper = r.tracingHelper;
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
      this.host = t.host, this.protocol = t.protocol, this.headerBuilder = new Un({ apiKey: r, tracingHelper: this.tracingHelper, logLevel: this.config.logLevel ?? "error", logQueries: this.config.logQueries, engineHash: this.engineHash }), this.remoteClientVersion = await yl(this.host, this.config), Lt("host", this.host), Lt("protocol", this.protocol);
    })(), await this.startPromise;
  }
  async stop() {
  }
  propagateResponseExtensions(r) {
    r?.logs?.length && r.logs.forEach((t) => {
      switch (t.level) {
        case "debug":
        case "trace":
          Lt(t);
          break;
        case "error":
        case "warn":
        case "info": {
          this.logEmitter.emit(t.level, { timestamp: io(t.timestamp), message: t.attributes.message ?? "", target: t.target ?? "BinaryEngine" });
          break;
        }
        case "query": {
          this.logEmitter.emit("query", { query: t.attributes.query ?? "", timestamp: io(t.timestamp), duration: t.attributes.duration_ms ?? 0, params: t.attributes.params ?? "", target: t.target ?? "BinaryEngine" });
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
      let t = await pr(await this.url("schema"), { method: "PUT", headers: this.headerBuilder.build(), body: this.inlineSchema, clientVersion: this.clientVersion });
      t.ok || Lt("schema response status", t.status);
      let n = await _t(t, this.clientVersion);
      if (n) throw this.logEmitter.emit("warn", { message: `Error while uploading schema: ${n.message}`, timestamp: /* @__PURE__ */ new Date(), target: "" }), n;
      this.logEmitter.emit("info", { message: `Schema (re)uploaded (hash: ${this.inlineSchemaHash})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
    });
  }
  request(r, { traceparent: t, interactiveTransaction: n, customDataProxyFetch: i }) {
    return this.requestInternal({ body: r, traceparent: t, interactiveTransaction: n, customDataProxyFetch: i });
  }
  async requestBatch(r, { traceparent: t, transaction: n, customDataProxyFetch: i }) {
    let o = n?.kind === "itx" ? n.options : void 0, s = Fr(r, n);
    return (await this.requestInternal({ body: s, customDataProxyFetch: i, interactiveTransaction: o, traceparent: t })).map((l) => (l.extensions && this.propagateResponseExtensions(l.extensions), "errors" in l ? this.convertProtocolErrorsToClientError(l.errors) : l));
  }
  requestInternal({ body: r, traceparent: t, customDataProxyFetch: n, interactiveTransaction: i }) {
    return this.withRetry({ actionGerund: "querying", callback: /* @__PURE__ */ __name(async ({ logHttpCall: o }) => {
      let s = i ? `${i.payload.endpoint}/graphql` : await this.url("graphql");
      o(s);
      let a = await pr(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: t, transactionId: i?.id }), body: JSON.stringify(r), clientVersion: this.clientVersion }, n);
      a.ok || Lt("graphql response status", a.status), await this.handleError(await _t(a, this.clientVersion));
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
        let l = await pr(a, { method: "POST", headers: this.headerBuilder.build({ traceparent: t.traceparent }), body: s, clientVersion: this.clientVersion });
        await this.handleError(await _t(l, this.clientVersion));
        let u = await l.json(), { extensions: c } = u;
        c && this.propagateResponseExtensions(c);
        let p = u.id, d = u["data-proxy"].endpoint;
        return { id: p, payload: { endpoint: d } };
      } else {
        let s = `${n.payload.endpoint}/${r}`;
        o(s);
        let a = await pr(s, { method: "POST", headers: this.headerBuilder.build({ traceparent: t.traceparent }), clientVersion: this.clientVersion });
        await this.handleError(await _t(a, this.clientVersion));
        let l = await a.json(), { extensions: u } = l;
        u && this.propagateResponseExtensions(u);
        return;
      }
    }, "callback") });
  }
  getURLAndAPIKey() {
    return cl({ clientVersion: this.clientVersion, env: this.env, inlineDatasources: this.inlineDatasources, overrideDatasources: this.config.overrideDatasources });
  }
  metrics() {
    throw new ur("Metrics are not yet supported for Accelerate", { clientVersion: this.clientVersion });
  }
  async withRetry(r) {
    for (let t = 0; ; t++) {
      let n = /* @__PURE__ */ __name((i) => {
        this.logEmitter.emit("info", { message: `Calling ${i} (n=${t})`, timestamp: /* @__PURE__ */ new Date(), target: "" });
      }, "n");
      try {
        return await r.callback({ logHttpCall: n });
      } catch (i) {
        if (!(i instanceof ne) || !i.isRetryable) throw i;
        if (t >= bl) throw i instanceof Vr ? i.cause : i;
        this.logEmitter.emit("warn", { message: `Attempt ${t + 1}/${bl} failed for ${r.actionGerund}: ${i.message ?? "(unknown)"}`, timestamp: /* @__PURE__ */ new Date(), target: "" });
        let o = await dl(t);
        this.logEmitter.emit("warn", { message: `Retrying after ${o}ms`, timestamp: /* @__PURE__ */ new Date(), target: "" });
      }
    }
  }
  async handleError(r) {
    if (r instanceof cr) throw await this.uploadSchema(), new Vr({ clientVersion: this.clientVersion, cause: r });
    if (r) throw r;
  }
  convertProtocolErrorsToClientError(r) {
    return r.length === 1 ? Mr(r[0], this.config.clientVersion, this.config.activeProvider) : new q(JSON.stringify(r), { clientVersion: this.config.clientVersion });
  }
  applyPendingMigrations() {
    throw new Error("Method not implemented.");
  }
};
function El(e10) {
  if (e10?.kind === "itx") return e10.options.id;
}
__name(El, "El");
var po = Symbol("PrismaLibraryEngineCache");
function lf() {
  let e10 = globalThis;
  return e10[po] === void 0 && (e10[po] = {}), e10[po];
}
__name(lf, "lf");
function uf(e10) {
  let r = lf();
  if (r[e10] !== void 0) return r[e10];
  let t = af.toNamespacedPath(e10), n = { exports: {} }, i = 0;
  return process2.platform !== "win32" && (i = wl.constants.dlopen.RTLD_LAZY | wl.constants.dlopen.RTLD_DEEPBIND), process2.dlopen(n, t, i), r[e10] = n.exports, n.exports;
}
__name(uf, "uf");
var xl = { async loadLibrary(e10) {
  let r = await ii(), t = await rl("library", e10);
  try {
    return e10.tracingHelper.runInChildSpan({ name: "loadLibrary", internal: true }, () => uf(t));
  } catch (n) {
    let i = yi({ e: n, platformInfo: r, id: t });
    throw new P(i, e10.clientVersion);
  }
} };
var mo;
var vl = { async loadLibrary(e10) {
  let { clientVersion: r, adapter: t, engineWasm: n } = e10;
  if (t === void 0) throw new P(`The \`adapter\` option for \`PrismaClient\` is required in this context (${no().prettyName})`, r);
  if (n === void 0) throw new P("WASM engine was unexpectedly `undefined`", r);
  mo === void 0 && (mo = (async () => {
    let o = await n.getRuntime(), s = await n.getQueryEngineWasmModule();
    if (s == null) throw new P("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", r);
    let a = { "./query_engine_bg.js": o }, l = new WebAssembly.Instance(s, a), u = l.exports.__wbindgen_start;
    return o.__wbg_set_wasm(l.exports), u(), o.QueryEngine;
  })());
  let i = await mo;
  return { debugPanic() {
    return Promise.reject("{}");
  }, dmmf() {
    return Promise.resolve("{}");
  }, version() {
    return { commit: "unknown", version: "unknown" };
  }, QueryEngine: i };
} };
var cf = "P2036";
var Re = L("prisma:client:libraryEngine");
function pf(e10) {
  return e10.item_type === "query" && "query" in e10;
}
__name(pf, "pf");
function df(e10) {
  return "level" in e10 ? e10.level === "error" && e10.message === "PANIC" : false;
}
__name(df, "df");
var Pl = [...Zn, "native"];
var mf = 0xffffffffffffffffn;
var fo = 1n;
function ff() {
  let e10 = fo++;
  return fo > mf && (fo = 1n), e10;
}
__name(ff, "ff");
var Ur = class {
  static {
    __name(this, "Ur");
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
    this.libraryLoader = t ?? xl, r.engineWasm !== void 0 && (this.libraryLoader = t ?? vl), this.config = r, this.libraryStarted = false, this.logQueries = r.logQueries ?? false, this.logLevel = r.logLevel ?? "error", this.logEmitter = r.logEmitter, this.datamodel = r.inlineSchema, this.tracingHelper = r.tracingHelper, r.enableDebugLogs && (this.logLevel = "debug");
    let n = Object.keys(r.overrideDatasources)[0], i = r.overrideDatasources[n]?.url;
    n !== void 0 && i !== void 0 && (this.datasourceOverrides = { [n]: i }), this.libraryInstantiationPromise = this.instantiateLibrary();
  }
  wrapEngine(r) {
    return { applyPendingMigrations: r.applyPendingMigrations?.bind(r), commitTransaction: this.withRequestId(r.commitTransaction.bind(r)), connect: this.withRequestId(r.connect.bind(r)), disconnect: this.withRequestId(r.disconnect.bind(r)), metrics: r.metrics?.bind(r), query: this.withRequestId(r.query.bind(r)), rollbackTransaction: this.withRequestId(r.rollbackTransaction.bind(r)), sdlSchema: r.sdlSchema?.bind(r), startTransaction: this.withRequestId(r.startTransaction.bind(r)), trace: r.trace.bind(r), free: r.free?.bind(r) };
  }
  withRequestId(r) {
    return async (...t) => {
      let n = ff().toString();
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
    if (gf(a)) {
      let l = this.getExternalAdapterError(a, i?.errorRegistry);
      throw l ? l.error : new Z(a.message, { code: a.error_code, clientVersion: this.config.clientVersion, meta: a.meta });
    } else if (typeof a.message == "string") throw new q(a.message, { clientVersion: this.config.clientVersion });
    return a;
  }
  async instantiateLibrary() {
    if (Re("internalSetup"), this.libraryInstantiationPromise) return this.libraryInstantiationPromise;
    zn(), this.binaryTarget = await this.getCurrentBinaryTarget(), await this.tracingHelper.runInChildSpan("load_engine", () => this.loadEngine()), this.version();
  }
  async getCurrentBinaryTarget() {
    {
      if (this.binaryTarget) return this.binaryTarget;
      let r = await this.tracingHelper.runInChildSpan("detect_platform", () => nr());
      if (!Pl.includes(r)) throw new P(`Unknown ${ue("PRISMA_QUERY_ENGINE_LIBRARY")} ${ue(Q(r))}. Possible binaryTargets: ${$e(Pl.join(", "))} or a path to the query engine library.
You may have to run ${$e("prisma generate")} for your changes to take effect.`, this.config.clientVersion);
      return r;
    }
  }
  parseEngineResponse(r) {
    if (!r) throw new q("Response from the Engine was empty", { clientVersion: this.config.clientVersion });
    try {
      return JSON.parse(r);
    } catch {
      throw new q("Unable to JSON.parse response from engine", { clientVersion: this.config.clientVersion });
    }
  }
  async loadEngine() {
    if (!this.engine) {
      this.QueryEngineConstructor || (this.library = await this.libraryLoader.loadLibrary(this.config), this.QueryEngineConstructor = this.library.QueryEngine);
      try {
        let r = new WeakRef(this);
        this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(Yt));
        let t = await this.adapterPromise;
        t && Re("Using driver adapter: %O", t), this.engine = this.wrapEngine(new this.QueryEngineConstructor({ datamodel: this.datamodel, env: process2.env, logQueries: this.config.logQueries ?? false, ignoreEnvVarErrors: true, datasourceOverrides: this.datasourceOverrides ?? {}, logLevel: this.logLevel, configDir: this.config.cwd, engineProtocol: "json", enableTracing: this.tracingHelper.isEnabled() }, (n) => {
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
    t && (t.level = t?.level.toLowerCase() ?? "unknown", pf(t) ? this.logEmitter.emit("query", { timestamp: /* @__PURE__ */ new Date(), query: t.query, params: t.params, duration: Number(t.duration_ms), target: t.module_path }) : df(t) ? this.loggerRustPanic = new de(go(this, `${t.message}: ${t.reason} in ${t.file}:${t.line}:${t.column}`), this.config.clientVersion) : this.logEmitter.emit(t.level, { timestamp: /* @__PURE__ */ new Date(), message: t.message, target: t.module_path }));
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
        await this.engine?.connect(JSON.stringify(t)), this.libraryStarted = true, this.adapterPromise || (this.adapterPromise = this.config.adapter?.connect()?.then(Yt)), await this.adapterPromise, Re("library started");
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
      if (a.errors) throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], s?.errorRegistry) : new q(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion });
      if (this.loggerRustPanic) throw this.loggerRustPanic;
      return { data: a };
    } catch (s) {
      if (s instanceof P) throw s;
      if (s.code === "GenericFailure" && s.message?.startsWith("PANIC:")) throw new de(go(this, s.message), this.config.clientVersion);
      let a = this.parseRequestError(s.message);
      throw typeof a == "string" ? s : new q(`${a.message}
${a.backtrace}`, { clientVersion: this.config.clientVersion });
    }
  }
  async requestBatch(r, { transaction: t, traceparent: n }) {
    Re("requestBatch");
    let i = Fr(r, t);
    await this.start();
    let o = await this.adapterPromise;
    this.lastQuery = JSON.stringify(i), this.executingQueryPromise = this.engine?.query(this.lastQuery, JSON.stringify({ traceparent: n }), El(t));
    let s = await this.executingQueryPromise, a = this.parseEngineResponse(s);
    if (a.errors) throw a.errors.length === 1 ? this.buildQueryError(a.errors[0], o?.errorRegistry) : new q(JSON.stringify(a.errors), { clientVersion: this.config.clientVersion });
    let { batchResult: l, errors: u } = a;
    if (Array.isArray(l)) return l.map((c) => c.errors && c.errors.length > 0 ? this.loggerRustPanic ?? this.buildQueryError(c.errors[0], o?.errorRegistry) : { data: c });
    throw u && u.length === 1 ? new Error(u[0].error) : new Error(JSON.stringify(a));
  }
  buildQueryError(r, t) {
    if (r.user_facing_error.is_panic) return new de(go(this, r.user_facing_error.message), this.config.clientVersion);
    let n = this.getExternalAdapterError(r.user_facing_error, t);
    return n ? n.error : Mr(r, this.config.clientVersion, this.config.activeProvider);
  }
  getExternalAdapterError(r, t) {
    if (r.error_code === cf && t) {
      let n = r.meta?.id;
      rn(typeof n == "number", "Malformed external JS error received from the engine");
      let i = t.consumeError(n);
      return rn(i, "External error with reported id was not registered"), i;
    }
  }
  async metrics(r) {
    await this.start();
    let t = await this.engine.metrics(JSON.stringify(r));
    return r.format === "prometheus" ? t : this.parseEngineResponse(t);
  }
};
function gf(e10) {
  return typeof e10 == "object" && e10 !== null && e10.error_code !== void 0;
}
__name(gf, "gf");
function go(e10, r) {
  return al({ binaryTarget: e10.binaryTarget, title: r, version: e10.config.clientVersion, engineVersion: e10.versionInfo?.commit, database: e10.config.activeProvider, query: e10.lastQuery });
}
__name(go, "go");
function Tl({ url: e10, adapter: r, copyEngine: t, targetBuildType: n }) {
  let i = [], o = [], s = /* @__PURE__ */ __name((g) => {
    i.push({ _tag: "warning", value: g });
  }, "s"), a = /* @__PURE__ */ __name((g) => {
    let I = g.join(`
`);
    o.push({ _tag: "error", value: I });
  }, "a"), l = !!e10?.startsWith("prisma://"), u = en(e10), c = !!r, p = l || u;
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
__name(Tl, "Tl");
function Sl({ copyEngine: e10 = true }, r) {
  let t;
  try {
    t = qr({ inlineDatasources: r.inlineDatasources, overrideDatasources: r.overrideDatasources, env: { ...r.env, ...process2.env }, clientVersion: r.clientVersion });
  } catch {
  }
  let { ok: n, isUsing: i, diagnostics: o } = Tl({ url: t, adapter: r.adapter, copyEngine: e10, targetBuildType: "library" });
  for (let p of o.warnings) sn(...p.value);
  if (!n) {
    let p = o.errors[0];
    throw new X(p.value, { clientVersion: r.clientVersion });
  }
  let s = wr(r.generator), a = s === "library", l = s === "binary", u = s === "client", c = (i.accelerate || i.ppg) && !i.driverAdapters;
  return i.accelerate ? new Ft(r) : (i.driverAdapters, a ? new Ur(r) : new Ur(r));
}
__name(Sl, "Sl");
function Rl({ generator: e10 }) {
  return e10?.previewFeatures ?? [];
}
__name(Rl, "Rl");
var Al = /* @__PURE__ */ __name((e10) => ({ command: e10 }), "Al");
var Cl = /* @__PURE__ */ __name((e10) => e10.strings.reduce((r, t, n) => `${r}@P${n}${t}`), "Cl");
function Gr(e10) {
  try {
    return Il(e10, "fast");
  } catch {
    return Il(e10, "slow");
  }
}
__name(Gr, "Gr");
function Il(e10, r) {
  return JSON.stringify(e10.map((t) => Ol(t, r)));
}
__name(Il, "Il");
function Ol(e10, r) {
  if (Array.isArray(e10)) return e10.map((t) => Ol(t, r));
  if (typeof e10 == "bigint") return { prisma__type: "bigint", prisma__value: e10.toString() };
  if (vr(e10)) return { prisma__type: "date", prisma__value: e10.toJSON() };
  if (Ye.isDecimal(e10)) return { prisma__type: "decimal", prisma__value: e10.toJSON() };
  if (Buffer.isBuffer(e10)) return { prisma__type: "bytes", prisma__value: e10.toString("base64") };
  if (hf(e10)) return { prisma__type: "bytes", prisma__value: Buffer.from(e10).toString("base64") };
  if (ArrayBuffer.isView(e10)) {
    let { buffer: t, byteOffset: n, byteLength: i } = e10;
    return { prisma__type: "bytes", prisma__value: Buffer.from(t, n, i).toString("base64") };
  }
  return typeof e10 == "object" && r === "slow" ? kl(e10) : e10;
}
__name(Ol, "Ol");
function hf(e10) {
  return e10 instanceof ArrayBuffer || e10 instanceof SharedArrayBuffer ? true : typeof e10 == "object" && e10 !== null ? e10[Symbol.toStringTag] === "ArrayBuffer" || e10[Symbol.toStringTag] === "SharedArrayBuffer" : false;
}
__name(hf, "hf");
function kl(e10) {
  if (typeof e10 != "object" || e10 === null) return e10;
  if (typeof e10.toJSON == "function") return e10.toJSON();
  if (Array.isArray(e10)) return e10.map(Dl);
  let r = {};
  for (let t of Object.keys(e10)) r[t] = Dl(e10[t]);
  return r;
}
__name(kl, "kl");
function Dl(e10) {
  return typeof e10 == "bigint" ? e10.toString() : kl(e10);
}
__name(Dl, "Dl");
var yf = /^(\s*alter\s)/i;
var _l = L("prisma:client");
function ho(e10, r, t, n) {
  if (!(e10 !== "postgresql" && e10 !== "cockroachdb") && t.length > 0 && yf.exec(r)) throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
}
__name(ho, "ho");
var yo = /* @__PURE__ */ __name(({ clientMethod: e10, activeProvider: r }) => (t) => {
  let n = "", i;
  if (_n(t)) n = t.sql, i = { values: Gr(t.values), __prismaRawParameters__: true };
  else if (Array.isArray(t)) {
    let [o, ...s] = t;
    n = o, i = { values: Gr(s || []), __prismaRawParameters__: true };
  } else switch (r) {
    case "sqlite":
    case "mysql": {
      n = t.sql, i = { values: Gr(t.values), __prismaRawParameters__: true };
      break;
    }
    case "cockroachdb":
    case "postgresql":
    case "postgres": {
      n = t.text, i = { values: Gr(t.values), __prismaRawParameters__: true };
      break;
    }
    case "sqlserver": {
      n = Cl(t), i = { values: Gr(t.values), __prismaRawParameters__: true };
      break;
    }
    default:
      throw new Error(`The ${r} provider does not support ${e10}`);
  }
  return i?.values ? _l(`prisma.${e10}(${n}, ${i.values})`) : _l(`prisma.${e10}(${n})`), { query: n, parameters: i };
}, "yo");
var Nl = { requestArgsToMiddlewareArgs(e10) {
  return [e10.strings, ...e10.values];
}, middlewareArgsToRequestArgs(e10) {
  let [r, ...t] = e10;
  return new se(r, t);
} };
var Ll = { requestArgsToMiddlewareArgs(e10) {
  return [e10];
}, middlewareArgsToRequestArgs(e10) {
  return e10[0];
} };
function bo(e10) {
  return function(t, n) {
    let i, o = /* @__PURE__ */ __name((s = e10) => {
      try {
        return s === void 0 || s?.kind === "itx" ? i ??= Fl(t(s)) : Fl(t(s));
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
__name(bo, "bo");
function Fl(e10) {
  return typeof e10.then == "function" ? e10 : Promise.resolve(e10);
}
__name(Fl, "Fl");
var bf = di.split(".")[0];
var Ef = { isEnabled() {
  return false;
}, getTraceParent() {
  return "00-10-10-00";
}, dispatchEngineSpans() {
}, getActiveContext() {
}, runInChildSpan(e10, r) {
  return r();
} };
var Eo = class {
  static {
    __name(this, "Eo");
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
    let r = globalThis[`V${bf}_PRISMA_INSTRUMENTATION`], t = globalThis.PRISMA_INSTRUMENTATION;
    return r?.helper ?? t?.helper ?? Ef;
  }
};
function Ml() {
  return new Eo();
}
__name(Ml, "Ml");
function $l(e10, r = () => {
}) {
  let t, n = new Promise((i) => t = i);
  return { then(i) {
    return --e10 === 0 && t(r()), i?.(n);
  } };
}
__name($l, "$l");
function ql(e10) {
  return typeof e10 == "string" ? e10 : e10.reduce((r, t) => {
    let n = typeof t == "string" ? t : t.level;
    return n === "query" ? r : r && (t === "info" || r === "info") ? "info" : n;
  }, void 0);
}
__name(ql, "ql");
function Gn(e10) {
  return typeof e10.batchRequestIdx == "number";
}
__name(Gn, "Gn");
function Vl(e10) {
  if (e10.action !== "findUnique" && e10.action !== "findUniqueOrThrow") return;
  let r = [];
  return e10.modelName && r.push(e10.modelName), e10.query.arguments && r.push(wo(e10.query.arguments)), r.push(wo(e10.query.selection)), r.join("");
}
__name(Vl, "Vl");
function wo(e10) {
  return `(${Object.keys(e10).sort().map((t) => {
    let n = e10[t];
    return typeof n == "object" && n !== null ? `(${t} ${wo(n)})` : t;
  }).join(" ")})`;
}
__name(wo, "wo");
var wf = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
function xo(e10) {
  return wf[e10];
}
__name(xo, "xo");
var Qn = class {
  static {
    __name(this, "Qn");
  }
  constructor(r) {
    this.options = r;
    this.batches = {};
  }
  batches;
  tickActive = false;
  request(r) {
    let t = this.options.batchBy(r);
    return t ? (this.batches[t] || (this.batches[t] = [], this.tickActive || (this.tickActive = true, process2.nextTick(() => {
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
function dr(e10, r) {
  if (r === null) return r;
  switch (e10) {
    case "bigint":
      return BigInt(r);
    case "bytes": {
      let { buffer: t, byteOffset: n, byteLength: i } = Buffer.from(r, "base64");
      return new Uint8Array(t, n, i);
    }
    case "decimal":
      return new Ye(r);
    case "datetime":
    case "date":
      return new Date(r);
    case "time":
      return /* @__PURE__ */ new Date(`1970-01-01T${r}Z`);
    case "bigint-array":
      return r.map((t) => dr("bigint", t));
    case "bytes-array":
      return r.map((t) => dr("bytes", t));
    case "decimal-array":
      return r.map((t) => dr("decimal", t));
    case "datetime-array":
      return r.map((t) => dr("datetime", t));
    case "date-array":
      return r.map((t) => dr("date", t));
    case "time-array":
      return r.map((t) => dr("time", t));
    default:
      return r;
  }
}
__name(dr, "dr");
function vo(e10) {
  let r = [], t = xf(e10);
  for (let n = 0; n < e10.rows.length; n++) {
    let i = e10.rows[n], o = { ...t };
    for (let s = 0; s < i.length; s++) o[e10.columns[s]] = dr(e10.types[s], i[s]);
    r.push(o);
  }
  return r;
}
__name(vo, "vo");
function xf(e10) {
  let r = {};
  for (let t = 0; t < e10.columns.length; t++) r[e10.columns[t]] = null;
  return r;
}
__name(xf, "xf");
var vf = L("prisma:client:request_handler");
var Wn = class {
  static {
    __name(this, "Wn");
  }
  client;
  dataloader;
  logEmitter;
  constructor(r, t) {
    this.logEmitter = t, this.client = r, this.dataloader = new Qn({ batchLoader: Ga(async ({ requests: n, customDataProxyFetch: i }) => {
      let { transaction: o, otelParentCtx: s } = n[0], a = n.map((p) => p.protocolQuery), l = this.client._tracingHelper.getTraceParent(s), u = n.some((p) => xo(p.protocolQuery.action));
      return (await this.client._engine.requestBatch(a, { traceparent: l, transaction: Pf(o), containsWrite: u, customDataProxyFetch: i })).map((p, d) => {
        if (p instanceof Error) return p;
        try {
          return this.mapQueryEngineResult(n[d], p);
        } catch (f) {
          return f;
        }
      });
    }), singleLoader: /* @__PURE__ */ __name(async (n) => {
      let i = n.transaction?.kind === "itx" ? jl(n.transaction) : void 0, o = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: xo(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch });
      return this.mapQueryEngineResult(n, o);
    }, "singleLoader"), batchBy: /* @__PURE__ */ __name((n) => n.transaction?.id ? `transaction-${n.transaction.id}` : Vl(n.protocolQuery), "batchBy"), batchOrder(n, i) {
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
    return process2.env.PRISMA_CLIENT_GET_TIME ? { data: o } : o;
  }
  handleAndLogRequestError(r) {
    try {
      this.handleRequestError(r);
    } catch (t) {
      throw this.logEmitter && this.logEmitter.emit("error", { message: t.message, target: r.clientMethod, timestamp: /* @__PURE__ */ new Date() }), t;
    }
  }
  handleRequestError({ error: r, clientMethod: t, callsite: n, transaction: i, args: o, modelName: s, globalOmit: a }) {
    if (vf(r), Tf(r, i)) throw r;
    if (r instanceof Z && Sf(r)) {
      let u = Bl(r.meta);
      In({ args: o, errors: [u], callsite: n, errorFormat: this.client._errorFormat, originalMethod: t, clientVersion: this.client._clientVersion, globalOmit: a });
    }
    let l = r.message;
    if (n && (l = wn({ callsite: n, originalMethod: t, isPanic: r.isPanic, showColors: this.client._errorFormat === "pretty", message: l })), l = this.sanitizeMessage(l), r.code) {
      let u = s ? { modelName: s, ...r.meta } : r.meta;
      throw new Z(l, { code: r.code, clientVersion: this.client._clientVersion, meta: u, batchRequestIdx: r.batchRequestIdx });
    } else {
      if (r.isPanic) throw new de(l, this.client._clientVersion);
      if (r instanceof q) throw new q(l, { clientVersion: this.client._clientVersion, batchRequestIdx: r.batchRequestIdx });
      if (r instanceof P) throw new P(l, this.client._clientVersion);
      if (r instanceof de) throw new de(l, this.client._clientVersion);
    }
    throw r.clientVersion = this.client._clientVersion, r;
  }
  sanitizeMessage(r) {
    return this.client._errorFormat && this.client._errorFormat !== "pretty" ? xr(r) : r;
  }
  unpack(r, t, n) {
    if (!r || (r.data && (r = r.data), !r)) return r;
    let i = Object.keys(r)[0], o = Object.values(r)[0], s = t.filter((u) => u !== "select" && u !== "include"), a = Xi(o, s), l = i === "queryRaw" ? vo(a) : vt(a);
    return n ? n(l) : l;
  }
  get [Symbol.toStringTag]() {
    return "RequestHandler";
  }
};
function Pf(e10) {
  if (e10) {
    if (e10.kind === "batch") return { kind: "batch", options: { isolationLevel: e10.isolationLevel } };
    if (e10.kind === "itx") return { kind: "itx", options: jl(e10) };
    sr(e10, "Unknown transaction kind");
  }
}
__name(Pf, "Pf");
function jl(e10) {
  return { id: e10.id, payload: e10.payload };
}
__name(jl, "jl");
function Tf(e10, r) {
  return Gn(e10) && r?.kind === "batch" && e10.batchRequestIdx !== r.index;
}
__name(Tf, "Tf");
function Sf(e10) {
  return e10.code === "P2009" || e10.code === "P2012";
}
__name(Sf, "Sf");
function Bl(e10) {
  if (e10.kind === "Union") return { kind: "Union", errors: e10.errors.map(Bl) };
  if (Array.isArray(e10.selectionPath)) {
    let [, ...r] = e10.selectionPath;
    return { ...e10, selectionPath: r };
  }
  return e10;
}
__name(Bl, "Bl");
var Ul = ul;
var Kl = le(qi());
var k = class extends Error {
  static {
    __name(this, "k");
  }
  constructor(r) {
    super(r + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientConstructorValidationError";
  }
};
x(k, "PrismaClientConstructorValidationError");
var Gl = ["datasources", "datasourceUrl", "errorFormat", "adapter", "log", "transactionOptions", "omit", "__internal"];
var Ql = ["pretty", "colorless", "minimal"];
var Wl = ["info", "query", "warn", "error"];
var Rf = { datasources: /* @__PURE__ */ __name((e10, { datasourceNames: r }) => {
  if (e10) {
    if (typeof e10 != "object" || Array.isArray(e10)) throw new k(`Invalid value ${JSON.stringify(e10)} for "datasources" provided to PrismaClient constructor`);
    for (let [t, n] of Object.entries(e10)) {
      if (!r.includes(t)) {
        let i = Qr(t, r) || ` Available datasources: ${r.join(", ")}`;
        throw new k(`Unknown datasource ${t} provided to PrismaClient constructor.${i}`);
      }
      if (typeof n != "object" || Array.isArray(n)) throw new k(`Invalid value ${JSON.stringify(e10)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
      if (n && typeof n == "object") for (let [i, o] of Object.entries(n)) {
        if (i !== "url") throw new k(`Invalid value ${JSON.stringify(e10)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
        if (typeof o != "string") throw new k(`Invalid value ${JSON.stringify(o)} for datasource "${t}" provided to PrismaClient constructor.
It should have this form: { url: "CONNECTION_STRING" }`);
      }
    }
  }
}, "datasources"), adapter: /* @__PURE__ */ __name((e10, r) => {
  if (!e10 && wr(r.generator) === "client") throw new k('Using engine type "client" requires a driver adapter to be provided to PrismaClient constructor.');
  if (e10 !== null) {
    if (e10 === void 0) throw new k('"adapter" property must not be undefined, use null to conditionally disable driver adapters.');
    if (wr(r.generator) === "binary") throw new k('Cannot use a driver adapter with the "binary" Query Engine. Please use the "library" Query Engine.');
  }
}, "adapter"), datasourceUrl: /* @__PURE__ */ __name((e10) => {
  if (typeof e10 < "u" && typeof e10 != "string") throw new k(`Invalid value ${JSON.stringify(e10)} for "datasourceUrl" provided to PrismaClient constructor.
Expected string or undefined.`);
}, "datasourceUrl"), errorFormat: /* @__PURE__ */ __name((e10) => {
  if (e10) {
    if (typeof e10 != "string") throw new k(`Invalid value ${JSON.stringify(e10)} for "errorFormat" provided to PrismaClient constructor.`);
    if (!Ql.includes(e10)) {
      let r = Qr(e10, Ql);
      throw new k(`Invalid errorFormat ${e10} provided to PrismaClient constructor.${r}`);
    }
  }
}, "errorFormat"), log: /* @__PURE__ */ __name((e10) => {
  if (!e10) return;
  if (!Array.isArray(e10)) throw new k(`Invalid value ${JSON.stringify(e10)} for "log" provided to PrismaClient constructor.`);
  function r(t) {
    if (typeof t == "string" && !Wl.includes(t)) {
      let n = Qr(t, Wl);
      throw new k(`Invalid log level "${t}" provided to PrismaClient constructor.${n}`);
    }
  }
  __name(r, "r");
  for (let t of e10) {
    r(t);
    let n = { level: r, emit: /* @__PURE__ */ __name((i) => {
      let o = ["stdout", "event"];
      if (!o.includes(i)) {
        let s = Qr(i, o);
        throw new k(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
      }
    }, "emit") };
    if (t && typeof t == "object") for (let [i, o] of Object.entries(t)) if (n[i]) n[i](o);
    else throw new k(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
  }
}, "log"), transactionOptions: /* @__PURE__ */ __name((e10) => {
  if (!e10) return;
  let r = e10.maxWait;
  if (r != null && r <= 0) throw new k(`Invalid value ${r} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
  let t = e10.timeout;
  if (t != null && t <= 0) throw new k(`Invalid value ${t} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
}, "transactionOptions"), omit: /* @__PURE__ */ __name((e10, r) => {
  if (typeof e10 != "object") throw new k('"omit" option is expected to be an object.');
  if (e10 === null) throw new k('"omit" option can not be `null`');
  let t = [];
  for (let [n, i] of Object.entries(e10)) {
    let o = Cf(n, r.runtimeDataModel);
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
  if (t.length > 0) throw new k(If(e10, t));
}, "omit"), __internal: /* @__PURE__ */ __name((e10) => {
  if (!e10) return;
  let r = ["debug", "engine", "configOverride"];
  if (typeof e10 != "object") throw new k(`Invalid value ${JSON.stringify(e10)} for "__internal" to PrismaClient constructor`);
  for (let [t] of Object.entries(e10)) if (!r.includes(t)) {
    let n = Qr(t, r);
    throw new k(`Invalid property ${JSON.stringify(t)} for "__internal" provided to PrismaClient constructor.${n}`);
  }
}, "__internal") };
function Hl(e10, r) {
  for (let [t, n] of Object.entries(e10)) {
    if (!Gl.includes(t)) {
      let i = Qr(t, Gl);
      throw new k(`Unknown property ${t} provided to PrismaClient constructor.${i}`);
    }
    Rf[t](n, r);
  }
  if (e10.datasourceUrl && e10.datasources) throw new k('Can not use "datasourceUrl" and "datasources" options at the same time. Pick one of them');
}
__name(Hl, "Hl");
function Qr(e10, r) {
  if (r.length === 0 || typeof e10 != "string") return "";
  let t = Af(e10, r);
  return t ? ` Did you mean "${t}"?` : "";
}
__name(Qr, "Qr");
function Af(e10, r) {
  if (r.length === 0) return null;
  let t = r.map((i) => ({ value: i, distance: (0, Kl.default)(e10, i) }));
  t.sort((i, o) => i.distance < o.distance ? -1 : 1);
  let n = t[0];
  return n.distance < 3 ? n.value : null;
}
__name(Af, "Af");
function Cf(e10, r) {
  return Jl(r.models, e10) ?? Jl(r.types, e10);
}
__name(Cf, "Cf");
function Jl(e10, r) {
  let t = Object.keys(e10).find((n) => Qe(n) === r);
  if (t) return e10[t];
}
__name(Jl, "Jl");
function If(e10, r) {
  let t = _r(e10);
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
  let { message: n, args: i } = Cn(t, "colorless");
  return `Error validating "omit" option:

${i}

${n}`;
}
__name(If, "If");
function Yl(e10) {
  return e10.length === 0 ? Promise.resolve([]) : new Promise((r, t) => {
    let n = new Array(e10.length), i = null, o = false, s = 0, a = /* @__PURE__ */ __name(() => {
      o || (s++, s === e10.length && (o = true, i ? t(i) : r(n)));
    }, "a"), l = /* @__PURE__ */ __name((u) => {
      o || (o = true, t(u));
    }, "l");
    for (let u = 0; u < e10.length; u++) e10[u].then((c) => {
      n[u] = c, a();
    }, (c) => {
      if (!Gn(c)) {
        l(c);
        return;
      }
      c.batchRequestIdx === u ? l(c) : (i || (i = c), a());
    });
  });
}
__name(Yl, "Yl");
var rr = L("prisma:client");
typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
var _f = { requestArgsToMiddlewareArgs: /* @__PURE__ */ __name((e10) => e10, "requestArgsToMiddlewareArgs"), middlewareArgsToRequestArgs: /* @__PURE__ */ __name((e10) => e10, "middlewareArgsToRequestArgs") };
var Nf = Symbol.for("prisma.client.transaction.id");
var Lf = { id: 0, nextId() {
  return ++this.id;
} };
function Ff(e10) {
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
    _createPrismaPromise = bo();
    constructor(n) {
      e10 = n?.__internal?.configOverride?.(e10) ?? e10, Ha(e10), n && Hl(n, e10);
      let i = new Of().on("error", () => {
      });
      this._extensions = Nr.empty(), this._previewFeatures = Rl(e10), this._clientVersion = e10.clientVersion ?? Ul, this._activeProvider = e10.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Ml();
      let o = e10.relativeEnvPaths && { rootEnvPath: e10.relativeEnvPaths.rootEnvPath && Po.resolve(e10.dirname, e10.relativeEnvPaths.rootEnvPath), schemaEnvPath: e10.relativeEnvPaths.schemaEnvPath && Po.resolve(e10.dirname, e10.relativeEnvPaths.schemaEnvPath) }, s;
      if (n?.adapter) {
        s = n.adapter;
        let l = e10.activeProvider === "postgresql" || e10.activeProvider === "cockroachdb" ? "postgres" : e10.activeProvider;
        if (s.provider !== l) throw new P(`The Driver Adapter \`${s.adapterName}\`, based on \`${s.provider}\`, is not compatible with the provider \`${l}\` specified in the Prisma schema.`, this._clientVersion);
        if (n.datasources || n.datasourceUrl !== void 0) throw new P("Custom datasource configuration is not compatible with Prisma Driver Adapters. Please define the database connection string directly in the Driver Adapter configuration.", this._clientVersion);
      }
      let a = !s && o && it(o, { conflictCheck: "none" }) || e10.injectableEdgeEnv?.();
      try {
        let l = n ?? {}, u = l.__internal ?? {}, c = u.debug === true;
        c && L.enable("prisma:client");
        let p = Po.resolve(e10.dirname, e10.relativePath);
        kf.existsSync(p) || (p = e10.dirname), rr("dirname", e10.dirname), rr("relativePath", e10.relativePath), rr("cwd", p);
        let d = u.engine || {};
        if (l.errorFormat ? this._errorFormat = l.errorFormat : process2.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : process2.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e10.runtimeDataModel, this._engineConfig = { cwd: p, dirname: e10.dirname, enableDebugLogs: c, allowTriggerPanic: d.allowTriggerPanic, prismaPath: d.binaryPath ?? void 0, engineEndpoint: d.endpoint, generator: e10.generator, showColors: this._errorFormat === "pretty", logLevel: l.log && ql(l.log), logQueries: l.log && !!(typeof l.log == "string" ? l.log === "query" : l.log.find((f) => typeof f == "string" ? f === "query" : f.level === "query")), env: a?.parsed ?? {}, flags: [], engineWasm: e10.engineWasm, compilerWasm: e10.compilerWasm, clientVersion: e10.clientVersion, engineVersion: e10.engineVersion, previewFeatures: this._previewFeatures, activeProvider: e10.activeProvider, inlineSchema: e10.inlineSchema, overrideDatasources: Ya(l, e10.datasourceNames), inlineDatasources: e10.inlineDatasources, inlineSchemaHash: e10.inlineSchemaHash, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: l.transactionOptions?.maxWait ?? 2e3, timeout: l.transactionOptions?.timeout ?? 5e3, isolationLevel: l.transactionOptions?.isolationLevel }, logEmitter: i, isBundled: e10.isBundled, adapter: s }, this._accelerateEngineConfig = { ...this._engineConfig, accelerateUtils: { resolveDatasourceUrl: qr, getBatchRequestPayload: Fr, prismaGraphQLToJSError: Mr, PrismaClientUnknownRequestError: q, PrismaClientInitializationError: P, PrismaClientKnownRequestError: Z, debug: L("prisma:client:accelerateEngine"), engineVersion: Zl.version, clientVersion: e10.clientVersion } }, rr("clientVersion", e10.clientVersion), this._engine = Sl(e10, this._engineConfig), this._requestHandler = new Wn(this, i), l.log) for (let f of l.log) {
          let h = typeof f == "string" ? f : f.emit === "stdout" ? f.level : null;
          h && this.$on(h, (g) => {
            rt.log(`${rt.tags[h] ?? ""}`, g.message || g.query);
          });
        }
      } catch (l) {
        throw l.clientVersion = this._clientVersion, l;
      }
      return this._appliedParent = wt(this);
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
        $o();
      }
    }
    $executeRawInternal(n, i, o, s) {
      let a = this._activeProvider;
      return this._request({ action: "executeRaw", args: o, transaction: n, clientMethod: i, argsMapper: yo({ clientMethod: i, activeProvider: a }), callsite: Ze(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
    }
    $executeRaw(n, ...i) {
      return this._createPrismaPromise((o) => {
        if (n.raw !== void 0 || n.sql !== void 0) {
          let [s, a] = zl(n, i);
          return ho(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o, "$executeRaw", s, a);
        }
        throw new X("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
      });
    }
    $executeRawUnsafe(n, ...i) {
      return this._createPrismaPromise((o) => (ho(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o, "$executeRawUnsafe", [n, ...i])));
    }
    $runCommandRaw(n) {
      if (e10.activeProvider !== "mongodb") throw new X(`The ${e10.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
      return this._createPrismaPromise((i) => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: Al, callsite: Ze(this._errorFormat), transaction: i }));
    }
    async $queryRawInternal(n, i, o, s) {
      let a = this._activeProvider;
      return this._request({ action: "queryRaw", args: o, transaction: n, clientMethod: i, argsMapper: yo({ clientMethod: i, activeProvider: a }), callsite: Ze(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
    }
    $queryRaw(n, ...i) {
      return this._createPrismaPromise((o) => {
        if (n.raw !== void 0 || n.sql !== void 0) return this.$queryRawInternal(o, "$queryRaw", ...zl(n, i));
        throw new X("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
      });
    }
    $queryRawTyped(n) {
      return this._createPrismaPromise((i) => {
        if (!this._hasPreviewFlag("typedSql")) throw new X("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
        return this.$queryRawInternal(i, "$queryRawTyped", n);
      });
    }
    $queryRawUnsafe(n, ...i) {
      return this._createPrismaPromise((o) => this.$queryRawInternal(o, "$queryRawUnsafe", [n, ...i]));
    }
    _transactionWithArray({ promises: n, options: i }) {
      let o = Lf.nextId(), s = $l(n.length), a = n.map((l, u) => {
        if (l?.[Symbol.toStringTag] !== "PrismaPromise") throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
        let c = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, p = { kind: "batch", id: o, index: u, isolationLevel: c, lock: s };
        return l.requestTransaction?.(p) ?? l;
      });
      return Yl(a);
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
      return he(wt(he(Na(this), [ee("_appliedParent", () => this._appliedParent._createItxClient(n)), ee("_createPrismaPromise", () => bo(n)), ee(Nf, () => n.id)])), [Lr(qa)]);
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
      let i = n.middlewareArgsMapper ?? _f, o = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { operation: { name: "operation", attributes: { method: o.action, model: o.model, name: o.model ? `${o.model}.${o.action}` : o.action } } }, a = /* @__PURE__ */ __name(async (l) => {
        let { runInTransaction: u, args: c, ...p } = l, d = { ...n, ...p };
        c && (d.args = i.middlewareArgsToRequestArgs(c)), n.transaction !== void 0 && u === false && delete d.transaction;
        let f = await Ua(this, d);
        return d.model ? $a({ result: f, modelName: d.model, args: d.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : f;
      }, "a");
      return this._tracingHelper.runInChildSpan(s.operation, () => new Df("prisma-client-request").runInAsyncScope(() => a(o)));
    }
    async _executeRequest({ args: n, clientMethod: i, dataPath: o, callsite: s, action: a, model: l, argsMapper: u, transaction: c, unpacker: p, otelParentCtx: d, customDataProxyFetch: f }) {
      try {
        n = u ? u(n) : n;
        let h = { name: "serialize" }, g = this._tracingHelper.runInChildSpan(h, () => Ji({ modelName: l, runtimeDataModel: this._runtimeDataModel, action: a, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
        return L.enabled("prisma:client") && (rr("Prisma Client call:"), rr(`prisma.${i}(${Pa(n)})`), rr("Generated request:"), rr(JSON.stringify(g, null, 2) + `
`)), c?.kind === "batch" && await c.lock, this._requestHandler.request({ protocolQuery: g, modelName: l, action: a, clientMethod: i, dataPath: o, callsite: s, args: n, extensions: this._extensions, transaction: c, unpacker: p, otelParentCtx: d, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: f });
      } catch (h) {
        throw h.clientVersion = this._clientVersion, h;
      }
    }
    $metrics = new ht(this);
    _hasPreviewFlag(n) {
      return !!this._engineConfig.previewFeatures?.includes(n);
    }
    $applyPendingMigrations() {
      return this._engine.applyPendingMigrations();
    }
    $extends = La;
  }
  return r;
}
__name(Ff, "Ff");
function zl(e10, r) {
  return Mf(e10) ? [new se(e10, r), Nl] : [e10, Ll];
}
__name(zl, "zl");
function Mf(e10) {
  return Array.isArray(e10) && Array.isArray(e10.raw);
}
__name(Mf, "Mf");
var $f = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
function qf(e10) {
  return new Proxy(e10, { get(r, t) {
    if (t in r) return r[t];
    if (!$f.has(t)) throw new TypeError(`Invalid enum value: ${String(t)}`);
  } });
}
__name(qf, "qf");

// app/generated/prisma/internal/class.ts
var config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client"
    },
    "output": {
      "value": "C:\\Users\\ANUSHKA SINGH\\Desktop\\summer_project\\ghost-ai\\app\\generated\\prisma",
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
    "sourceFilePath": "C:\\Users\\ANUSHKA SINGH\\Desktop\\summer_project\\ghost-ai\\prisma\\schema.prisma",
    "isCustomOutput": true
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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../app/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nenum ProjectStatus {\n  DRAFT\n  ARCHIVED\n}\n\nmodel Project {\n  id             String                @id @default(cuid())\n  ownerId        String                @db.Text\n  name           String                @db.Text\n  description    String?               @db.Text\n  status         ProjectStatus         @default(DRAFT)\n  canvasJsonPath String?               @db.Text\n  createdAt      DateTime              @default(now())\n  updatedAt      DateTime              @updatedAt\n  collaborators  ProjectCollaborator[]\n  specs          ProjectSpec[]\n\n  @@index([ownerId])\n  @@index([createdAt])\n}\n\nmodel ProjectCollaborator {\n  id        String   @id @default(cuid())\n  projectId String\n  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  email     String   @db.Text\n  createdAt DateTime @default(now())\n\n  @@unique([projectId, email])\n  @@index([email])\n  @@index([projectId, createdAt])\n}\n\nmodel TaskRun {\n  id        String   @id @default(cuid())\n  runId     String   @unique @db.Text\n  projectId String\n  userId    String   @db.Text\n  createdAt DateTime @default(now())\n\n  @@index([runId])\n  @@index([userId, projectId])\n}\n\nmodel ProjectSpec {\n  id        String   @id @default(cuid())\n  projectId String\n  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)\n  filePath  String   @db.Text\n  createdAt DateTime @default(now())\n\n  @@index([projectId])\n}\n',
  "inlineSchemaHash": "26324b5bc780d1def264da3c792716ed194791fb9bdcafbfdad415d3e24fac39",
  "copyEngine": true,
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "dirname": ""
};
config.runtimeDataModel = JSON.parse('{"models":{"Project":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"ownerId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"enum","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"ProjectStatus","nativeType":null,"default":"DRAFT","isGenerated":false,"isUpdatedAt":false},{"name":"canvasJsonPath","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","nativeType":null,"isGenerated":false,"isUpdatedAt":true},{"name":"collaborators","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ProjectCollaborator","nativeType":null,"relationName":"ProjectToProjectCollaborator","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"specs","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ProjectSpec","nativeType":null,"relationName":"ProjectToProjectSpec","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ProjectCollaborator":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"project","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","nativeType":null,"relationName":"ProjectToProjectCollaborator","relationFromFields":["projectId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["projectId","email"]],"uniqueIndexes":[{"name":null,"fields":["projectId","email"]}],"isGenerated":false},"TaskRun":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"runId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ProjectSpec":{"dbName":null,"schema":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","nativeType":null,"default":{"name":"cuid","args":[1]},"isGenerated":false,"isUpdatedAt":false},{"name":"projectId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","nativeType":null,"isGenerated":false,"isUpdatedAt":false},{"name":"project","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Project","nativeType":null,"relationName":"ProjectToProjectSpec","relationFromFields":["projectId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"filePath","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","nativeType":["Text",[]],"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","nativeType":null,"default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{"ProjectStatus":{"values":[{"name":"DRAFT","dbName":null},{"name":"ARCHIVED","dbName":null}],"dbName":null}},"types":{}}');
config.engineWasm = void 0;
config.compilerWasm = void 0;
function getPrismaClientClass(dirname3) {
  config.dirname = dirname3;
  return Ff(config);
}
__name(getPrismaClientClass, "getPrismaClientClass");

// app/generated/prisma/internal/prismaNamespace.ts
init_esm();
var getExtensionContext = Ao.getExtensionContext;
var NullTypes = {
  DbNull: Bi.classes.DbNull,
  JsonNull: Bi.classes.JsonNull,
  AnyNull: Bi.classes.AnyNull
};
var DbNull = Bi.instances.DbNull;
var JsonNull = Bi.instances.JsonNull;
var AnyNull = Bi.instances.AnyNull;
var TransactionIsolationLevel = qf({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = Ao.defineExtension;

// app/generated/prisma/enums.ts
init_esm();

// app/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath2(import.meta.url));
var PrismaClient = getPrismaClientClass(__dirname);
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process3.cwd(), "app/generated/prisma/query_engine-windows.dll.node");

// lib/prisma.ts
var globalForPrisma = globalThis;
var connectionString = process.env.DATABASE_URL;
var prismaClientSingleton = /* @__PURE__ */ __name(() => {
  if (!connectionString) {
    console.error("DATABASE_URL must be set");
    process.exit(1);
  }
  const adapter = new PrismaPgAdapterFactory({ connectionString });
  return new PrismaClient({ adapter });
}, "prismaClientSingleton");
var prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
export {
  prisma
};
/*! Bundled license information:

@prisma/client/runtime/library.mjs:
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
//# sourceMappingURL=prisma-E6ESA422.mjs.map
