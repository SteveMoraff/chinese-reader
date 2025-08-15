import re
import json

def convert_to_json(input_file, output_file):
    # Initialize an empty dictionary
    data_dict = {}

    # Define a regular expression pattern to extract key and value
    pattern = re.compile(r'dict\[(0x[0-9A-Fa-f]+)\]\s*=\s*"([^"]+)";')

    # Open and read the input file
    with open(input_file, 'r', encoding='utf-8') as infile:
        for line_number, line in enumerate(infile, 1):
            # Use regex to find matches
            match = pattern.search(line)
            if match:
                key = match.group(1)  # e.g., '0x3400'
                value = match.group(2)  # e.g., 'qiū'
                data_dict[key] = value
            else:
                # Optionally, handle lines that don't match the pattern
                print(f"Warning: Line {line_number} is not in the expected format and will be skipped.")

    # Write the dictionary to a JSON file
    with open(output_file, 'w', encoding='utf-8') as outfile:
        json.dump(data_dict, outfile, ensure_ascii=False, indent=4)

    print(f"Conversion complete. JSON data has been saved to '{output_file}'.")

if __name__ == "__main__":
    # Specify the input and output file paths
    input_file = 'input.txt'    # Replace with your actual input file path
    output_file = 'pinyin.json'  # Desired output file path

    convert_to_json(input_file, output_file)

