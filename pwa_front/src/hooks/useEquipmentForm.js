import { useState, useCallback } from 'react';
import { formConf } from '../utils/formConf';

/**
 * Hook to resolve the dynamic form schema based on the selected category path.
 * Path structure from ManualCategorySelection:
 * [0] Tier 1: Category (e.g., {id: 'cat1', name: '類別一'})
 * [1] Tier 2: Emission Type (e.g., {id: 'stationary combustion', name: '固定式燃燒'})
 * [2] Tier 3: Equipment Type (e.g., {id: 'eq1', name: '旋風式鍋爐'})
 */
export function useEquipmentForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resolveSchema = useCallback((pathData) => {
    if (!pathData || pathData.length < 3) return null;

    setLoading(true);
    setError(null);

    try {
      const tier2Key = String(pathData[1].emissionTypeKey || pathData[1].id).toLowerCase().trim();
      const tier3Key = String(pathData[2].equipmentTypeKey || pathData[2].id).toLowerCase().trim();
      const tier2Name = String(pathData[1].name).toLowerCase().trim();
      const tier3Name = String(pathData[2].name).toLowerCase().trim();

      // 1. Lookup configurations using normalized keys
      const equipmentConf = formConf[tier3Key] || formConf[tier3Name] || {};
      const categoryConf = formConf[tier2Key] || formConf[tier2Name] || {};
      const defaultConf = formConf.default;

      // 2. Merge Logic (Parity with legacy ActivityForm.js)
      // If useConfFirst is true on the equipment level, it takes priority.
      const extraConf = (equipmentConf.useConfFirst ? equipmentConf : categoryConf) || equipmentConf;
      
      const resolved = {
        ...defaultConf,
        ...extraConf,
        // Ensure apis are merged correctly
        apis: { ...defaultConf.apis, ...categoryConf.apis, ...equipmentConf.apis, ...extraConf.apis }
      };

      // 3. Construct the final schema arrays
      const schema = {
        topForm: resolved.topForm || defaultConf.topForm,
        middleForm: resolved.middleForm || [],
        bottomForm: resolved.bottomForm || defaultConf.bottomForm,
        apis: resolved.apis,
        saveFormatting: resolved.saveFormatting || defaultConf.saveFormatting,
        initSetup: resolved.initSetup,
        fetchKey: resolved.fetchKey || 'equipmentTypeId'
      };

      setLoading(false);
      return schema;

    } catch (err) {
      console.error('Schema Resolution Error:', err);
      setError('無法解析表單配置');
      setLoading(false);
      return null;
    }
  }, []);

  return { loading, error, resolveSchema };
}
