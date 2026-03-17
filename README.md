# is-valid-tfn

`is-valid-tfn` is a small TypeScript package that exports `isValidTFN(value: unknown): boolean` and checks whether a value matches the best publicly supported validation rules for an Australian Tax File Number (TFN).

This repository started as a fork/template of [`wojtekmaj/is-valid-abn`](https://github.com/wojtekmaj/is-valid-abn). The original project structure and MIT license were retained as attribution, but the TFN research, implementation, tests, package metadata, and documentation were rewritten for this repository.

## API

```ts
export default function isValidTFN(value: unknown): boolean;
```

Returns `true` when the input matches this package's supported TFN formatting and checksum rules. Returns `false` otherwise.

## Behavior Summary

- Accepts `unknown` input and returns `false` for `null`, `undefined`, empty strings, and whitespace-only strings.
- Accepts string, number, bigint, and other values that produce a candidate through `String(value)`.
- Accepts ASCII digits with optional spaces.
- Rejects alphabetic characters and unsupported punctuation such as hyphens.
- Rejects malformed lengths other than 8 or 9 digits after removing spaces.
- Validates 9-digit TFNs with the public modulo-11 rule corroborated by multiple secondary technical sources.
- Validates legacy 8-digit TFNs using the best public secondary evidence available.
- Rejects ATO substitute/reporting codes such as `000000000`, `111111111`, `333333333`, `444444444`, and `987654321`.
- Only checks mathematical validity. It does not prove that a TFN was actually issued to a person or entity.

## Research Methodology

I used the following source order:

1. Official ATO developer material.
2. Other official government references.
3. Independent technical references and library implementations.
4. Stack Overflow only as supporting context.

The public ATO developer specification was the anchor source. It clearly distinguishes a valid TFN from substitute reporting codes and confirms that a TFN checksum algorithm exists, but it does not publish the exact checksum weights in the public document. Because of that gap, the exact weights had to come from corroborating secondary sources.

The public evidence is strongest for 9-digit TFNs. Legacy 8-digit TFNs are the main area of ambiguity. Official sources confirm that 8-digit TFNs exist and refer to an "8 or 9 digit TFN algorithm", but the current public ATO material does not publish the legacy weights. I therefore compared independent secondary implementations and documented the conflict instead of hiding it.

## Evidence Table

| Claim | Evidence summary | Source link | Source type | Accessed date |
| --- | --- | --- | --- | --- |
| Valid TFNs and substitute reporting codes are different concepts | The ATO TFN declaration reporting spec says the payee TFN field must contain a valid TFN, but when a TFN is missing or invalid it requires substitute codes such as `000000000`, `111111111`, `333333333`, `444444444`, and `987654321`. | [ATO TFN declaration reporting specification v4.0.3](https://softwaredevelopers.ato.gov.au/sites/default/files/2024-09/Tax_file_number_TFN_declaration_reporting_version_4.0.3.docx) | official | 2026-03-17 |
| Alphabetic TFN input is not a valid TFN | The same ATO spec says `987654321` must be lodged when alphabetic characters appear in a quoted TFN or the quoted TFN cannot fit in the field. | [ATO TFN declaration reporting specification v4.0.3](https://softwaredevelopers.ato.gov.au/sites/default/files/2024-09/Tax_file_number_TFN_declaration_reporting_version_4.0.3.docx) | official | 2026-03-17 |
| The public ATO spec confirms an algorithm exists but does not publish the exact public weights | Section 9 says the TFN algorithm is available through Online services for DSPs or by request to the DPO, rather than printing the algorithm directly in the public spec. | [ATO TFN declaration reporting specification v4.0.3](https://softwaredevelopers.ato.gov.au/sites/default/files/2024-09/Tax_file_number_TFN_declaration_reporting_version_4.0.3.docx) | official | 2026-03-17 |
| TFNs can be 8 digits or 9 digits | The public ATO spec says the WPN algorithm uses the "8 or 9 digit TFN algorithm" after removing leading zeros. The ANAO audit describes a TFN as an 8- or 9-digit number whose last digit is generated from a 7- or 8-digit base. | [ATO TFN declaration reporting specification v4.0.3](https://softwaredevelopers.ato.gov.au/sites/default/files/2024-09/Tax_file_number_TFN_declaration_reporting_version_4.0.3.docx), [ANAO audit](https://www.anao.gov.au/work/performance-audit/the-australian-taxation-office-tax-file-number-system) | official | 2026-03-17 |
| Spaces are a reasonable formatting tolerance | The OECD Australia TIN note says the TFN is stored as an 8- or 9-digit string and may be displayed in groups of three digits. Technical libraries such as `python-stdnum` also accept spaces. | [OECD Australia TIN note](https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/Australia-TIN.pdf), [python-stdnum AU TFN source](https://raw.githubusercontent.com/arthurdejong/python-stdnum/master/stdnum/au/tfn.py) | official, secondary | 2026-03-17 |
| The 9-digit checksum rule is a modulo-11 weighted sum | Clearwater documents weights `[1, 4, 3, 7, 5, 8, 6, 9, 10]` and a modulo-11 check. `python-stdnum` independently uses the same 9-digit weights. | [Clearwater TFN reference](https://clearwater.com.au/code/tfn/), [python-stdnum AU TFN source](https://raw.githubusercontent.com/arthurdejong/python-stdnum/master/stdnum/au/tfn.py) | secondary | 2026-03-17 |
| Best-available public evidence for legacy 8-digit TFNs supports a separate weight set | A Stack Overflow answer cites the older ATO `obtainTFNalgorithm` page and gives 8-digit weights `[10, 7, 8, 4, 6, 3, 5, 1]`. The `tfn-validator` package independently uses the same 8-digit weights. | [Stack Overflow discussion](https://stackoverflow.com/questions/40252533/is-there-any-algorithm-to-validate-australian-tfn-number), [tfn-validator package](https://www.npmjs.com/package/tfn-validator) | community, secondary | 2026-03-17 |
| Secondary sources conflict on legacy 8-digit handling | `python-stdnum` accepts 8-digit TFNs but reuses the 9-digit weight prefix, which conflicts with sources that distinguish separate 8- and 9-digit algorithms. | [python-stdnum AU TFN source](https://raw.githubusercontent.com/arthurdejong/python-stdnum/master/stdnum/au/tfn.py), [tfn-validator package](https://www.npmjs.com/package/tfn-validator) | secondary | 2026-03-17 |

## Decision Log

### Why 8-digit TFNs are supported

Official sources say TFNs can be 8 digits or 9 digits, but the public ATO document does not print the legacy weights. I chose to support legacy 8-digit TFNs because:

- the ATO wording implies distinct 8- and 9-digit algorithms rather than a single public 9-digit rule,
- the ANAO audit independently confirms that 8-digit TFNs exist and include a check digit,
- a Stack Overflow answer citing the older ATO `obtainTFNalgorithm` page and the `tfn-validator` package agree on the 8-digit weights `[10, 7, 8, 4, 6, 3, 5, 1]`.

I did not follow `python-stdnum` for legacy 8-digit TFNs because it reuses the 9-digit weights on 8-digit input, which conflicts with the sources above and with the official wording that refers to an "8 or 9 digit TFN algorithm". This is therefore a best-available-evidence decision, not a direct quotation of a current public ATO checksum table.

### Why spaces are accepted

The OECD Australia TIN note says TFNs may be displayed in groups of three digits, and multiple technical implementations accept spaced input. I therefore accept spaces as a formatting convenience.

This package does not strip arbitrary punctuation. In particular, it rejects hyphens and alphabetic characters rather than trying to guess what the user meant.

### Why substitute reporting codes are rejected

The public ATO specification explicitly says those codes are used in place of a TFN in reporting contexts when the payee has not quoted one, is applying for one, is exempt, or provided invalid alphabetic content. They are valid reporting substitutes in that context, but they are not valid TFNs.

Because the exported API is `isValidTFN(...)`, this package rejects substitute codes.

### Why alphabetic characters are rejected

The ATO reporting specification instructs payers to use `987654321` when alphabetic characters appear in the quoted TFN. That is strong official evidence that alphabetic input is not a valid TFN and should not be normalized into one.

### Whether the public official docs fully disclose the checksum weights

No. The current public ATO developer specification confirms that the algorithm exists and recommends using it in software, but it does not print the exact checksum weights in the public document. Exact weights therefore require secondary corroboration.

### Why the chosen 9-digit rule is still strong

Clearwater and `python-stdnum` agree on the familiar 9-digit weights `[1, 4, 3, 7, 5, 8, 6, 9, 10]`.

The `tfn-validator` package presents a different 9-digit weight vector, `[10, 7, 8, 4, 6, 3, 5, 2, 1]`, but that vector is just the Clearwater vector multiplied by `10` modulo `11`. Because multiplying every weight by a non-zero constant modulo `11` does not change which sums are divisible by `11`, both forms define the same 9-digit validity test.

## Limitations

- Passing this validator means the input matches a checksum and formatting rule. It does not prove that the TFN was ever issued.
- This package is not legal, accounting, or tax advice.
- The current public ATO developer documents do not publish the exact checksum weights directly.
- Legacy 8-digit support is based on best available public evidence, not on a currently public ATO checksum table.
- Secondary sources conflict on 8-digit handling. That conflict is documented above.
- This package accepts spaces but intentionally does not accept every punctuation style that some third-party libraries strip.

## Usage Example

```ts
import isValidTFN from 'is-valid-tfn';

isValidTFN('876543210'); // true
isValidTFN('876 543 210'); // true
isValidTFN('12345677'); // true (legacy 8-digit support)

isValidTFN('987654321'); // false, substitute reporting code
isValidTFN('876-543-210'); // false, hyphens are not accepted
isValidTFN('87654A3210'); // false, alphabetic characters are rejected
```

The examples above are checksum-valid examples only. They should not be treated as proof that a TFN has actually been issued.

## Development

This repository uses [`mise`](https://mise.jdx.dev/) for tool management and task execution, and it uses Microsoft's native TypeScript preview (`tsgo`) for typechecking and builds.

```sh
mise install
mise run install
mise run test
mise run build
```

Useful tasks:

- `mise run format`
- `mise run lint`
- `mise run typecheck`
- `mise run unit`
- `mise run test`
- `mise run build`

For VS Code, this repository includes workspace settings that recommend the official [TypeScript (Native Preview)](https://marketplace.visualstudio.com/items?itemName=TypeScriptTeam.native-preview) extension and enable `js/ts.experimental.useTsgo` so the editor uses the same native language service as the command line.

## Verification Notes

The following commands were run after implementation:

- `mise run install`
  Result: installed the local Node dependencies with `pnpm`.
- `mise run test`
  Result: `biome check`, `tsgo`, and `vitest run` all passed. Vitest reported `1` test file and `11` passing tests.
- `mise run build`
  Result: `tsgo --project tsconfig.build.json` built the package into `dist/` successfully.

## Source Links

- [ATO developer TFN declaration spec landing page](https://softwaredevelopers.ato.gov.au/tax-file-number-declaration-reporting-specification)
- [ATO TFN declaration reporting specification v4.0.3](https://softwaredevelopers.ato.gov.au/sites/default/files/2024-09/Tax_file_number_TFN_declaration_reporting_version_4.0.3.docx)
- [OECD Australia TIN note](https://www.oecd.org/tax/automatic-exchange/crs-implementation-and-assistance/tax-identification-numbers/Australia-TIN.pdf)
- [ANAO audit: The Australian Taxation Office's Tax File Number System](https://www.anao.gov.au/work/performance-audit/the-australian-taxation-office-tax-file-number-system)
- [Clearwater TFN reference](https://clearwater.com.au/code/tfn/)
- [python-stdnum AU TFN source](https://raw.githubusercontent.com/arthurdejong/python-stdnum/master/stdnum/au/tfn.py)
- [Stack Overflow discussion](https://stackoverflow.com/questions/40252533/is-there-any-algorithm-to-validate-australian-tfn-number)
- [tfn-validator package](https://www.npmjs.com/package/tfn-validator)
