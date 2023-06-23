import { Rate } from './rate';
import { Components, Timecode } from './timecode';

// TimecodeRegex is the pattern for a valid SMPTE timecode
const TimecodeRegex = /^(\d\d)(:|;)(\d\d)(:|;)(\d\d)(:|;)(\d+)$/;

// Parse parses a timecode from a string, and treats it using the provided frame rate value
export function Parse(timecode: string, rate: Rate): Timecode {
	// Match it against the regular expression
	const match = timecode.match(TimecodeRegex);
	if (!match) {
		throw new Error('invalid timecode format');
	}

	// Get the components
	const hours = parseInt(match[1], 10);
	const minutes = parseInt(match[3], 10);
	const seconds = parseInt(match[5], 10);
	const frames = parseInt(match[7], 10);

	// Determine if it's drop frame based on the final separator
	const dropFrame = match[6] === ';';

	// Combine the components
	return FromComponents(
		{
			hours,
			minutes,
			seconds,
			frames,
		},
		rate,
		dropFrame
	);
}

export function FromComponents(
	components: Components,
	rate: Rate,
	dropFrame: boolean
): Timecode {
	// If the rate is drop frame, we need to check that the provided frame
	// isn't a dropped frame, which needs to be rounded to the nearest
	// valid frame timecode
	if (
		dropFrame &&
		components.minutes % 10 > 0 &&
		components.seconds == 0 &&
		components.frames < rate.drop
	) {
		// Move to the next valid frame in sequence
		components.frames = rate.drop;
	}

	// Count up the total number of nominal frames
	const totalMinutes = components.hours * 60 + components.minutes;
	let totalFrames =
		(totalMinutes * 60 + components.seconds) * rate.nominal +
		components.frames;

	// If it's drop frame, account for the drop incidents
	if (dropFrame) {
		const dropFrameIncidents = totalMinutes - Math.floor(totalMinutes / 10);
		if (dropFrameIncidents > 0) {
			totalFrames -= dropFrameIncidents * rate.drop;
		}
	}

	// Return the timecode with the total frames
	return new Timecode(totalFrames, rate, dropFrame);
}
