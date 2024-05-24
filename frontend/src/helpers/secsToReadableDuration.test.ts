import {secsToReadableDuration} from "./secsToReadableDuration";

const second = 1;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

function expectConversion(secs: number, expected: string) {
	expect(secsToReadableDuration(secs)).toBe(expected);
}

describe("testDebug", () => {
	it("attempts (by GH-Copliot) to brute-force coverage, after i told it local Istanbul reports 100% but CI only 20%", () => {
		expect(secsToReadableDuration(0.9)).toBe("");
		expect(secsToReadableDuration(1.1)).toBe("1s");
		expect(secsToReadableDuration(60)).toBe("1m");
		expect(secsToReadableDuration(3600)).toBe("1h");
		expect(secsToReadableDuration(86400)).toBe("1d");
		expect(secsToReadableDuration(3599)).toBe("59m 59s");
		expect(secsToReadableDuration(64804)).toBe("18h 4s");
	});
});

describe("secsToReadableDuration", () => {
	it("Round decimals down", () => {
		expectConversion(0.9, "");
		expectConversion(1.1, "1s");
	});

	it("Convert to the correct time units", () => {
		expectConversion(second, "1s");

		expectConversion(second * 59, "59s");
		expectConversion(second * 60, "1m");

		expectConversion(minute * 59, "59m");
		expectConversion(minute * 60, "1h");

		expectConversion(hour * 23, "23h");
		expectConversion(hour * 24, "1d");
	});

	it("Convert to multiple time units correctly", () => {
		expectConversion(minute * 59 + second * 59, "59m 59s");

		expectConversion(hour * 18 + second * 4, "18h 4s");

		expectConversion(day * 2 + minute * 34, "2d 34m");

		expectConversion(day * 3 + minute * 17 + second * 33, "3d 17m 33s");

		expectConversion(day * 6 + hour * 23 + minute * 59 + second * 59, "6d 23h 59m 59s");
	});
});
