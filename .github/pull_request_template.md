## Description

Please include a summary of the changes and the related issue or specification requirement.

Fixes # (issue)

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Security / Performance enhancement

## Verification Checklist

Please check all items that apply before requesting review:

- [ ] My code follows the style guidelines of this project (no pill shapes, no em dashes).
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have updated the documentation accordingly.
- [ ] `pytest backend/tests -v` passes with zero failures.
- [ ] `npm --prefix frontend test -- --run` passes with zero failures.
- [ ] `npm --prefix frontend run build` completes with zero errors.
- [ ] `python3 -m pip_audit -r backend/requirements.txt` reports 0 vulnerabilities.
- [ ] `npm --prefix frontend audit` reports 0 vulnerabilities.
- [ ] `detect-secrets scan` passes with zero exposed credentials.
- [ ] Verified zero em dashes (`—`) introduced in copy or code.

