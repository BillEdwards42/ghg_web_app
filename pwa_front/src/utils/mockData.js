// Generate Mock Data for Corp and Location
export const generateMockData = () => {
  const data = [];
  for (let i = 0; i < 10; i++) {
    const char = String.fromCharCode(65 + i); // A, B, C...
    const corp = {
      name: `Rick_${char}`,
      isBuilding: true,
      children: []
    };
    for (let j = 1; j <= 10; j++) {
      const num = String(j).padStart(2, '0'); // 01, 02...
      corp.children.push({
        name: `${char}_${num}`,
        isLocation: true
      });
    }
    data.push(corp);
  }
  return data;
};

export const corpAndLocData = generateMockData();
