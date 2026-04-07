# Legacy Form System

The legacy form system located in `pwa_front/formjs` serves as a technical reference for the complex manual entry logic used in previous iterations of the product.

This directory contains the original implementation of the activity forms, including complex cascading components and specialized table inputs. While the current PWA uses a modernized and streamlined version of these concepts, the legacy code remains a valuable resource for understanding the business logic and edge cases of carbon accounting.

### Key Components for Reference
- **[[pwa_front/formjs/formConf.js]]**: The original, more extensive version of the form registry. It contains historical field mappings and validation rules.
- **[[pwa_front/formjs/FormComponent.js]]**: The legacy equivalent of `ManualEntryPopup`, showing how fields were historically rendered and managed.
- **[[pwa_front/formjs/CascaderComponent.js]]**: Implementation of multi-tier selection logic, which informed the design of `ManualCategorySelection`.
- **[[pwa_front/formjs/MainTable.js]]**: Reference for grid-based data entry, useful for maintaining the [[employee-commuting]] module.

### Usage Note
Do not copy code directly from this directory into the main `src/` folder. Instead, use it to understand the intended behavior of complex categories (like Category 3-6) and to verify that the new implementation covers all necessary data points.
