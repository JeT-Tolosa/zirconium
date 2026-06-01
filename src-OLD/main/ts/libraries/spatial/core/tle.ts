export interface TLE {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  line0?: string;
  line1?: string;
  line2?: string;
  EPOCH?: string;
  MEAN_MOTION?: number;
  CLASSIFICATION_TYPE?: string;
  ECCENTRICITY?: number;
  INCLINATION?: number;
  RA_OF_ASC_NODE?: number;
  ARG_OF_PERICENTER?: number;
  MEAN_ANOMALY?: number;
  EPHEMERIS_TYPE?: number;
  NORAD_CAT_ID?: number;
  ELEMENT_SET_NO?: number;
  REV_AT_EPOCH?: number;
  BSTAR?: number;
  MEAN_MOTION_DOT?: number;
  MEAN_MOTION_DDOT?: number;
}

export class TLEHelper {
  /**
   * Validates a single TLE line using structural rules and NORAD checksum verification.
   *
   * This function checks:
   * - Minimum line length (69 characters required for valid TLE format)
   * - Correct checksum in the last character of the line
   * - Consistency with the NORAD checksum algorithm
   *
   * The checksum ensures data integrity by validating the sum of numeric
   * characters and specific symbols in the first 68 characters.
   *
   * @param line A single TLE line (line 1 or line 2)
   * @param lineNumber Line index (used for error reporting)
   * @throws Error if line is invalid or checksum does not match
   */
  public static validateTLELine(line: string, lineNumber: number): void {
    line = line.replace(/\r$/, '');
    if (line.length < 69) {
      throw new Error(`Line ${lineNumber} too short`);
    }
    const expected = Number(line[68]);
    const computed = this.tleChecksum(line);
    if (expected !== computed) {
      throw new Error(
        `Invalid checksum on line ${lineNumber} (expected ${expected}, got ${computed})`,
      );
    }
  }

  /**
   * Extracts the epoch field from a TLE line 1.
   *
   * The epoch represents the reference time of the orbital elements
   * and is encoded in the format YYDDD.DDDDDDDD:
   * - YY: two-digit year
   * - DDD: day of year
   * - fractional part: time within the day
   *
   * This function returns the raw epoch string without conversion.
   *
   * @param line1 First line of a TLE
   * @returns Epoch string in YYDDD.DDDDDDDD format
   */
  public static parseEpoch(line1: string): string {
    const epochStr = line1.substring(18, 32).trim();
    return epochStr;
  }

  /**
   * Parses a TLE-style exponential number format into a JavaScript number.
   *
   * TLE fields often encode scientific notation in a compact form such as:
   * "12345-4" which represents 0.12345 × 10⁻⁴.
   *
   * This function:
   * - Detects TLE-specific exponential notation
   * - Converts it into a standard floating-point number
   * - Falls back to native parseFloat if format is not recognized
   *
   * @param str Raw TLE numeric field string
   * @returns Parsed floating-point number
   */
  public static parseExponential(str: string): number {
    const cleaned = str.trim();

    if (!cleaned) return 0;

    // format TLE: 12345-4 => 0.12345e-4
    const match = cleaned.match(/^([+-]?\d+)([+-]\d+)$/);

    if (!match) return parseFloat(cleaned);

    const base = parseFloat('0.' + match[1]);
    const exp = parseInt(match[2], 10);

    return base * Math.pow(10, exp);
  }

  /**
   * Computes the NORAD checksum for a TLE line.
   *
   * The checksum is calculated by:
   * - Summing all numeric digits (0–9)
   * - Counting each '-' character as +1
   * - Ignoring all other characters
   * - Taking the result modulo 10
   *
   * This checksum is used to validate TLE integrity and detect corruption
   * or formatting errors in orbital data.
   *
   * @param line TLE line (first 68 characters are used)
   * @returns Computed checksum value (0–9)
   */
  public static tleChecksum(line: string): number {
    let sum = 0;

    // IMPORTANT:
    // checksum is computed ONLY on first 68 chars
    for (let i = 0; i < 68; i++) {
      const c = line[i];

      if (c >= '0' && c <= '9') {
        sum += Number(c);
      } else if (c === '-') {
        sum += 1;
      }
    }

    return sum % 10;
  }

  /**
   * Parses a raw TLE (Two-Line Element set) string into a structured TLE object.
   *
   * The input can contain either:
   * - 2 lines: standard TLE format (line1 + line2)
   * - 3 lines: optional first line containing the object name
   *
   * This function performs strict validation:
   * - Ensures correct number of lines (2 or 3)
   * - Validates TLE line structure and checksum (NORAD checksum)
   * - Verifies satellite ID consistency between line 1 and line 2
   * - Extracts and converts all orbital parameters from fixed-width fields
   *
   * Parsed fields include orbital elements such as:
   * inclination, eccentricity, mean motion, RAAN, argument of perigee,
   * mean anomaly, BSTAR drag term, and derivatives of mean motion.
   *
   * @param tleString Raw TLE string (2 or 3 lines)
   * @returns Parsed and validated TLE object
   * @throws Error if the TLE format is invalid or checksum verification fails
   */
  public static parseTLE(tleString: string): TLE {
    if (typeof tleString !== 'string') {
      throw new Error('TLE must be a string');
    }

    const lines = tleString.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length !== 2 && lines.length !== 3) {
      throw new Error('TLE must have 2 or 3 lines');
    }

    let line0: string;
    let line1: string;
    let line2: string;

    if (lines.length === 3) {
      line0 = lines[0];
      line1 = lines[1];
      line2 = lines[2];
    } else {
      line0 = null;
      line1 = lines[0];
      line2 = lines[1];
    }

    TLEHelper.validateTLELine(line1, 1);
    TLEHelper.validateTLELine(line2, 2);

    const satId1 = line1.substring(2, 7).trim();
    const satId2 = line2.substring(2, 7).trim();

    if (satId1 !== satId2) {
      throw new Error('Satellite ID mismatch between line 1 and line 2');
    }

    return {
      OBJECT_NAME: line0,
      OBJECT_ID: satId1,
      line0,
      line1,
      line2,
      EPOCH: TLEHelper.parseEpoch(line1),
      CLASSIFICATION_TYPE: line1.charAt(7),
      EPHEMERIS_TYPE: parseInt(line1.charAt(62), 10),
      ELEMENT_SET_NO: parseInt(line1.substring(64, 68), 10),
      NORAD_CAT_ID: parseInt(satId1, 10),
      BSTAR: TLEHelper.parseExponential(line1.substring(53, 61)),
      MEAN_MOTION_DOT: TLEHelper.parseExponential(line1.substring(33, 43)),
      MEAN_MOTION_DDOT: TLEHelper.parseExponential(line1.substring(44, 52)),
      INCLINATION: parseFloat(line2.substring(8, 16)),
      RA_OF_ASC_NODE: parseFloat(line2.substring(17, 25)),
      ECCENTRICITY: parseFloat('0.' + line2.substring(26, 33).trim()),
      ARG_OF_PERICENTER: parseFloat(line2.substring(34, 42)),
      MEAN_ANOMALY: parseFloat(line2.substring(43, 51)),
      MEAN_MOTION: parseFloat(line2.substring(52, 63)),
      REV_AT_EPOCH: parseInt(line2.substring(63, 68), 10),
    } as TLE;
  }

  /**
   * get the TLE epoch field from a validated TLE object and converts it into a JavaScript Date.
   *
   * This function extracts the `EPOCH` property from the TLE object and interprets it using the
   * standard TLE epoch format: YYDDD.DDDDDDDD.
   *
   * Format details:
   * - YY: two-digit year (mapped to 1900–1999 or 2000–2056 using NORAD convention)
   * - DDD: day of year (1–365 or 366 in leap years)
   * - .DDDDDDDD: fractional part of the day representing time of day in UTC
   *
   * The function performs strict validation:
   * - Ensures the TLE object exists and contains a valid EPOCH string
   * - Validates the epoch format using a regex
   * - Checks that the day-of-year is valid for the computed year (including leap years)
   *
   * The result is a JavaScript Date in UTC precision, including fractional day conversion.
   *
   * @param tle Parsed TLE object containing an EPOCH field in YYDDD.DDDDDDDD format
   * @returns JavaScript Date representing the epoch in UTC
   * @throws Error if the TLE object is invalid or the EPOCH format is incorrect
   */
  public static getTLEEpoch(tle: TLE): Date {
    if (!tle || typeof tle !== 'object') {
      throw new Error('TLE object is required');
    }
    const epoch: string = tle.EPOCH;

    if (typeof epoch !== 'string') {
      throw new Error('Missing or invalid EPOCH field in TLE object');
    }
    const e = epoch.trim();
    // Validate format: YYDDD.DDDDDDDD
    const match = e.match(/^(\d{2})(\d{3})(\.\d+)?$/);
    if (!match) {
      throw new Error(
        `Invalid TLE EPOCH format: expected YYDDD.DDDDDDDD, got "${epoch}"`,
      );
    }

    const yy = parseInt(match[1], 10);
    const doy = parseInt(match[2], 10);
    const fraction = parseFloat(match[3] || '.0');

    // Convert year (NORAD rule)
    const fullYear = yy < 57 ? 2000 + yy : 1900 + yy;
    // Leap year check
    const isLeapYear =
      (fullYear % 4 === 0 && fullYear % 100 !== 0) || fullYear % 400 === 0;
    const maxDay = isLeapYear ? 366 : 365;
    if (doy < 1 || doy > maxDay) {
      throw new Error(`Invalid day-of-year ${doy} for year ${fullYear}`);
    }

    // Build base date (UTC Jan 1)
    const date = new Date(Date.UTC(fullYear, 0, 1));

    // Add days
    date.setUTCDate(date.getUTCDate() + doy - 1);

    // Add fractional day
    const msInDay = 24 * 60 * 60 * 1000;
    const extraMs = fraction * msInDay;

    return new Date(date.getTime() + extraMs);
  }

  /**
   * Parses a TLE epoch from a string in the format YYDDD.DDDDDDDD and converts it to a JavaScript Date.
   *
   * The epoch format represents:
   * - YY: two-digit year (interpreted as 1900–1999 or 2000–2056)
   * - DDD: day of year (1–365 or 366 for leap years)
   * - .DDDDDDDD: optional fractional part of the day
   *
   * The function validates the input format, checks that the day-of-year is valid for the given year
   * (including leap year rules), and returns a UTC JavaScript Date with millisecond precision.
   *
   * @param {string} epoch - TLE epoch string in YYDDD.DDDDDDDD format
   * @returns {Date} JavaScript Date representing the corresponding UTC time
   * @throws {Error} If the input format is invalid or the day-of-year is out of range
   */
  public static parseTLEEpochFromString(epoch: string): Date {
    if (!epoch) return null;
    // Check type
    if (typeof epoch !== 'string') {
      throw new Error('Epoch must be a string (YYDDD.DDDDDDDD)');
    }

    // clean trailing spaces
    const e = epoch.trim();

    // Check format
    const match = e.match(/^(\d{2})(\d{3})(\.\d+)?$/);
    if (!match)
      throw new Error(
        `Invalid TLE epoch format. Expected YYDDD.DDDDDDDD. '${e}' is not`,
      );

    const yy = parseInt(match[1], 10);
    const doy = parseInt(match[2], 10);
    const fraction = parseFloat(match[3] || '.0');

    // Check year value
    const isLeapYear = (year: number) =>
      (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const fullYear = yy < 57 ? 2000 + yy : 1900 + yy;
    const maxDay = isLeapYear(fullYear) ? 366 : 365;
    if (doy < 1 || doy > maxDay) {
      throw new Error(`Invalid day of year: ${doy} for year ${fullYear}`);
    }

    // Conversion
    const date = new Date(Date.UTC(fullYear, 0, 1));
    date.setUTCDate(date.getUTCDate() + doy - 1);

    // Add remaining day floating value
    const msInDay = 24 * 60 * 60 * 1000;
    const extraMs = fraction * msInDay;

    return new Date(date.getTime() + extraMs);
  }
}
