/**
 * @jest-environment jsdom
 */

import CodeMirror from 'codemirror';
import { setup } from '../src/setup';
import load from '../src/data/load';
import circuitData from './circuits/sequential-circuitdata.json';
import testData from './testData/sequential-testdata.json';
import { runAll } from '../src/testbench';
import Rom from '../src/sequential/Rom';
import simulationArea from '../src/simulationArea';

jest.mock('codemirror');

describe('Simulator Sequential Element Testing', () => {
    CodeMirror.fromTextArea.mockReturnValueOnce({ setValue: (text) => {} });
    setup();
    test('load circuitData', () => {
        expect(() => load(circuitData)).not.toThrow();
    });

    test('D Flip Flop working', () => {
        const result = runAll(testData.DFlipFlop);
        expect(result.summary.passed).toBe(2);
    });

    test('D latch working', () => {
        const result = runAll(testData.DLatch);
        expect(result.summary.passed).toBe(2);
    });

    test('JK Flip Flop working', () => {
        const result = runAll(testData.JkFlipFlop);
        expect(result.summary.passed).toBe(4);
    });

    test('SR Flip Flop working', () => {
        const result = runAll(testData.SRFlipFlop);
        expect(result.summary.passed).toBe(4);
    });

    test('T Flip Flop working', () => {
        const result = runAll(testData.TFlipFlop);
        expect(result.summary.passed).toBe(4);
    });

    test('Rom keyDown correctly accepts hexadecimal keys 0-9 and a-f (case-insensitive)', () => {
        const rom = new Rom(0, 0);
        rom.selectedIndex = 0;
        rom.data[0] = 0;

        // Test typing 'f'
        rom.keyDown('f');
        expect(rom.data[0]).toBe(0x0f);

        // Test typing another hex digit 'a'
        rom.keyDown('a');
        expect(rom.data[0]).toBe(0xfa);

        // Test uppercase hex digit 'C' -> (0xFA * 16 + 0xC) % 256 = (250 * 16 + 12) % 256 = 0xAC
        rom.keyDown('C');
        expect(rom.data[0]).toBe(0xac);

        // Test digit '3' -> (0xAC * 16 + 3) % 256 = (172 * 16 + 3) % 256 = 0xC3
        rom.keyDown('3');
        expect(rom.data[0]).toBe(0xc3);

        // Test non-hex character is ignored
        rom.keyDown('z');
        expect(rom.data[0]).toBe(0xc3);
    });

    test('keyboard event dispatches to simulationArea.lastSelected.keyDown even when mouse is outside canvas', () => {
        global.listenToSimulator = true;
        window.listenToSimulator = true;
        const rom = new Rom(0, 0);
        rom.selectedIndex = 0;
        rom.data[0] = 0;
        simulationArea.lastSelected = rom;

        // Position mouse outside canvas bounds
        simulationArea.mouseRawX = -100;
        simulationArea.mouseRawY = -100;

        const event = new KeyboardEvent('keydown', { key: 'f', bubbles: true, cancelable: true });
        window.dispatchEvent(event);

        expect(rom.data[0]).toBe(0x0f);
        expect(event.defaultPrevented).toBe(true);
    });
});
