import { GetPlaybackDurationMilliseconds, Rate } from './rate';

export interface Components {
	hours: number;
	minutes: number;
	seconds: number;
	frames: number;
}

export interface Framer {
	frame: number;
}

export class Timecode {
	public constructor(
		public readonly frame: number,
		public readonly rate: Rate,
		public readonly dropFrame: boolean
	) {}

	private getComponentsNDF(frame: number): Components {
		// Track the remaining frames
		const frames = frame % this.rate.nominal;

		// Count the number of seconds
		const totalSeconds = (frame - frames) / this.rate.nominal;
		const seconds = totalSeconds % 60;

		// Count the number of minutes
		const totalMinutes = (totalSeconds - seconds) / 60;
		const minutes = totalMinutes % 60;

		// Count the total hours
		const hours = (totalMinutes - minutes) / 60;

		// Return the components
		return {
			hours,
			minutes,
			seconds,
			frames,
		};
	}

	private getComponentsDF(frame: number): Components {
		// Calculate the NDF components
		let comps = this.getComponentsNDF(frame);

		// Count the total number of minutes crossed
		const minutesCrossed = comps.hours * 60 + comps.minutes;
		let dropFrameIncidents =
			minutesCrossed - Math.floor(minutesCrossed / 10);

		// As long as there are unhandled drop frame incidents
		while (dropFrameIncidents > 0) {
			// Add the appropriate number of frames
			frame += dropFrameIncidents * this.rate.drop;

			// Recalculate the components
			const newComps = this.getComponentsNDF(frame);

			// Count the number of drop frame incidents that occurred
			dropFrameIncidents = 0;
			for (
				let m = comps.hours * 60 + comps.minutes + 1;
				m <= newComps.hours * 60 + newComps.minutes;
				m++
			) {
				if (m % 10 > 0) {
					dropFrameIncidents++;
				}
			}

			// Update the components
			comps = newComps;
		}
		return comps;
	}

	public getComponents(): Components {
		if (!this.dropFrame) {
			return this.getComponentsNDF(this.frame);
		} else {
			return this.getComponentsDF(this.frame);
		}
	}

	// toString creates a string representation for the timecode
	public toString(): string {
		// Get the components of the timecode
		const components = this.getComponents();

		// Determine the separator
		let sep = ':';
		if (this.dropFrame) {
			sep = ';';
		}

		// Determine the number of digits in the frame rate
		const frameDigits = this.rate.nominal.toFixed(0).length;

		const padLeftZero = (num: number, digits: number): string => {
			let str = num.toFixed(0);
			while (str.length < digits) {
				str = '0' + str;
			}
			return str;
		};

		// Create the format string for the frames
		const frameStr = padLeftZero(components.frames, frameDigits);

		// Format the timecode
		return (
			[
				padLeftZero(components.hours, 2),
				padLeftZero(components.minutes, 2),
				padLeftZero(components.seconds, 2),
			].join(':') +
			sep +
			frameStr
		);
	}

	// equals checks if this timecode is equal to another framer
	public equals(other: Framer | number): boolean {
		const otherFrame = typeof other === 'number' ? other : other.frame;
		return this.frame === otherFrame;
	}

	// add adds another framer instance to this timecode
	public add(other: Framer | number): Timecode {
		const otherFrame = typeof other === 'number' ? other : other.frame;
		return new Timecode(this.frame + otherFrame, this.rate, this.dropFrame);
	}

	public addSeconds(seconds: number): Timecode {
		return this.add(this.rate.nominal * seconds);
	}

	public addPlaybackSeconds(seconds: number): Timecode {
		return this.add(
			Math.max(
				0,
				Math.floor((seconds * this.rate.num) / this.rate.den) -
					(this.dropFrame ? 1 : 0)
			)
		);
	}

	// presentationTimeMilliseconds gets the actual presentation time of the timecode. With drop frame, this will drift from the timecode
	// time before snapping back into place periodically.
	public presentationTimeMilliseconds(): number {
		return GetPlaybackDurationMilliseconds(this.rate) * this.frame;
	}
}
