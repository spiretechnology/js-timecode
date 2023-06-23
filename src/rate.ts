// Rate represents a frame rate for a timecode
export interface Rate {
	nominal: number;
	drop: number;
	num: number;
	den: number;
}

export function ParseRate(str: string): Rate | null {
	switch (str) {
		case '23.976':
		case '23.98':
			return Rate_23_976;
		case '24':
			return Rate_24;
		case '29.97':
			return Rate_29_97;
		case '30':
			return Rate_30;
		case '59.94':
			return Rate_59_94;
		case '60':
			return Rate_60;
		default:
			return null;
	}
}

// 23.976 has exactly 24 frames per second. However, the textual representation of timecodes using this rate
// skip two frames every minute, except when the minute is a multiple of 10. This is because 23.976 footage
// actually does display at a rate of 23.976 frames each second on televisions. To ensure that the first
// timecode in an hour of footage is 00:00:00;00 and the last timecode in that hour is 01:00:00;00, drop
// frame was invented. It is purely a matter of presentation.
export const Rate_23_976: Rate = {
	nominal: 24,
	drop: 2,
	num: 24000,
	den: 1001,
};

// Standard 24 FPS, with no drop frame
export const Rate_24: Rate = {
	nominal: 24,
	drop: 0,
	num: 24,
	den: 1,
};

// Other formats...
export const Rate_30: Rate = {
	nominal: 30,
	drop: 0,
	num: 30,
	den: 1,
};
export const Rate_29_97: Rate = {
	nominal: 30,
	drop: 2,
	num: 30000,
	den: 1001,
};
export const Rate_60: Rate = {
	nominal: 60,
	drop: 0,
	num: 60,
	den: 1,
};
export const Rate_59_94: Rate = {
	nominal: 60,
	drop: 4,
	num: 60000,
	den: 1001,
};

export function GetPlaybackDurationMilliseconds(rate: Rate): number {
	return (rate.den / rate.num) * 1000;
}
