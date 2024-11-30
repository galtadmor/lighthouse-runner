import { type DistinctQuestion } from "inquirer";

export const prompts: DistinctQuestion[] = [
    {
        type: 'input',
        name: 'url',
        message: 'Enter the URL to test:',
        validate: (input: string) => {
            const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/;
            if (!urlPattern.test(input)) {
                return 'Please enter a valid URL';
            }
            return true;
        },
    },
    {
        type: 'number',
        name: 'runs',
        message: 'Enter the number of runs (between 1 and 100):',
        default: 1,
        validate: (input: number) => {
            if (input < 1 || input > 100) {
                return 'Number of runs must be between 1 and 100';
            }
            return true;
        },
    },
];