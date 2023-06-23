import { Parse } from './parse';
import { Rate_24, Rate_59_94 } from './rate';
import { Timecode } from './timecode';

describe('testing 59.94 fps (DF) parse to frame count', () => {
	test('parse DF timecode to frame count', () => {
		expect(Parse('00:00:00;00', Rate_59_94).frame).toBe(0);
		expect(Parse('00:00:01;00', Rate_59_94).frame).toBe(60);
		expect(Parse('00:01:00;04', Rate_59_94).frame).toBe(60 * 60);
	});
});

describe('testing 59.94 fps (DF) format from frame count', () => {
	test('format frame count to timecode string', () => {
		expect(new Timecode(0, Rate_59_94, true).toString()).toBe(
			'00:00:00;00'
		);
		expect(new Timecode(60, Rate_59_94, true).toString()).toBe(
			'00:00:01;00'
		);
		expect(new Timecode(60 * 60, Rate_59_94, true).toString()).toBe(
			'00:01:00;04'
		);
	});
});

describe('testing 59.94 fps (DF) parse and format', () => {
	test('parse and format timecodes without change', () => {
		expect(Parse('00:00:00;00', Rate_59_94).toString()).toBe('00:00:00;00');
		expect(Parse('00:00:01;00', Rate_59_94).toString()).toBe('00:00:01;00');
		expect(Parse('00:00:10;00', Rate_59_94).toString()).toBe('00:00:10;00');
		expect(Parse('00:01:00;04', Rate_59_94).toString()).toBe('00:01:00;04');
		expect(Parse('14:55:41;22', Rate_59_94).toString()).toBe('14:55:41;22');
		expect(Parse('14:00:41;22', Rate_59_94).toString()).toBe('14:00:41;22');
		expect(Parse('10:55:41;00', Rate_59_94).toString()).toBe('10:55:41;00');
		expect(Parse('14:55:41;22', Rate_59_94).toString()).toBe('14:55:41;22');
		expect(Parse('14:55:04;22', Rate_59_94).toString()).toBe('14:55:04;22');
		expect(Parse('13:15:00;40', Rate_59_94).toString()).toBe('13:15:00;40');
	});
});

describe('testing 59.94 fps (DF) add playback seconds', () => {
	test('add zero to start timecode', () => {
		expect(
			Parse('17:01:53;58', Rate_59_94).addPlaybackSeconds(0).toString()
		).toBe('17:01:53;58');
	});
});

describe('testing 59.94 fps (DF) frame increment', () => {
	test('adding one frame to start timecode', () => {
		expect(Parse('14:55:41;22', Rate_59_94).add(1).toString()).toBe(
			'14:55:41;23'
		);
		expect(Parse('14:56:59;59', Rate_59_94).add(1).toString()).toBe(
			'14:57:00;04'
		);
	});
});

describe('testing 59.94 fps (DF) offsets', () => {
	const start = Parse('14:55:41;22', Rate_59_94);
	test('adding ten seconds to start timecode', () => {
		expect(start.addSeconds(10).toString()).toBe('14:55:51;22');
	});
	test('adding one minute to start timecode', () => {
		expect(start.addSeconds(60).toString()).toBe('14:56:41;26');
	});
	test('adding ten minutes to start timecode', () => {
		expect(start.addSeconds(10 * 60).toString()).toBe('15:05:41;58');
	});
});

describe('testing 24 fps (NDF) offsets', () => {
	const start = Parse('14:55:41:22', Rate_24);
	test('adding one minute to start timecode', () => {
		const oneMinuteLater = start.addSeconds(60);
		expect(oneMinuteLater.toString()).toBe('14:56:41:22');
	});
	test('adding ten minutes to start timecode', () => {
		const tenMinutesLater = start.addSeconds(10 * 60);
		expect(tenMinutesLater.toString()).toBe('15:05:41:22');
	});
	test('adding 90 minutes to start timecode', () => {
		const ninetyMinutesLater = start.addSeconds(90 * 60);
		expect(ninetyMinutesLater.toString()).toBe('16:25:41:22');
	});
});
