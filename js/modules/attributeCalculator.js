const PERFORMANCE_SCORES = {
    Flash: 100,
    Top: 90,
};

const STYLE_TO_ATTRIBUTE_MAP = {
    Power: ['Power'],
    Physical: ['Power'],
    Fingers: ['Fingers'],
    Coordination: ['Coordination'],
    Dynamic: ['Coordination'],
    Balance: ['Balance'],
    Mobility: ['Balance'],
};

const GRADE_WEIGHTS = {
    1: { top: 0.9, flash: 0.1 },
    2: { top: 0.9, flash: 0.1 },
    3: { top: 1.8, flash: 0.2 },
    4: { top: 1.8, flash: 0.2 },
    5: { top: 1.8, flash: 0.2 },
    6: { top: 1.8, flash: 0.2 },
};


export function calculateDataAttributes(climberName, qResults, qBoulders) {
    const climberResults = qResults.filter(r => r.climber === climberName);

    const attributeGradeTotals = {}; // attributeGradeTotals[attribute][grade] = { flashes: 0, tops: 0, totalBoulders: 0 }
    const styleGradeTotals = {}; // styleGradeTotals[style][grade] = { flashes: 0, tops: 0, totalBoulders: 0 }

    let totalFlashedGrade = 0;
    let totalToppedGrade = 0;

    for (const result of climberResults) {
        const qualiBoulders = qBoulders.filter(b => b.quali === result.quali);
        for (const boulderName in result) {
            if (boulderName === 'climber' || boulderName === 'quali' || boulderName === 'timestamp') continue;

            const attempt = result[boulderName];
            if (!attempt || attempt === '') continue; // Skip empty results

            const boulder = qualiBoulders.find(b => b.name.toUpperCase() === boulderName.toUpperCase());
            if (!boulder) continue;

            const grade = parseInt(boulder.grade, 10);
            const attributes = STYLE_TO_ATTRIBUTE_MAP[boulder.style] || [];

            // Populate styleGradeTotals
            const style = boulder.style;
            if (style) {
                if (!styleGradeTotals[style]) {
                    styleGradeTotals[style] = {};
                }
                if (!styleGradeTotals[style][grade]) {
                    styleGradeTotals[style][grade] = { flashes: 0, tops: 0, totalBoulders: 0 };
                }
                styleGradeTotals[style][grade].totalBoulders++;
            }

            for (const attr of attributes) {
                if (!attributeGradeTotals[attr]) {
                    attributeGradeTotals[attr] = {};
                }
                if (!attributeGradeTotals[attr][grade]) {
                    attributeGradeTotals[attr][grade] = { flashes: 0, tops: 0, totalBoulders: 0 };
                }
                attributeGradeTotals[attr][grade].totalBoulders++;
            }

            if (attempt === 'Flash') {
                totalFlashedGrade += grade;
                if (style) {
                    styleGradeTotals[style][grade].flashes++;
                }
                for (const attr of attributes) {
                    attributeGradeTotals[attr][grade].flashes++;
                }
            }
            if (attempt === 'Flash' || attempt === 'Top') {
                totalToppedGrade += grade;
                if (style) {
                    styleGradeTotals[style][grade].tops++;
                }
                for (const attr of attributes) {
                    attributeGradeTotals[attr][grade].tops++;
                }
            }
        }
    }

    const calculatedAttributes = {};
    const attributesToCalculateWithNewFormula = ['Power', 'Fingers', 'Coordination', 'Balance'];

    for (const attr of attributesToCalculateWithNewFormula) {
        let totalScore = 0;
        for (let grade = 1; grade <= 6; grade++) {
            const gradeData = attributeGradeTotals[attr] && attributeGradeTotals[attr][grade];
            if (gradeData && gradeData.totalBoulders > 0) {
                const topPercentage = gradeData.tops / gradeData.totalBoulders;
                const flashPercentage = gradeData.flashes / gradeData.totalBoulders;
                const weights = GRADE_WEIGHTS[grade];

                if (weights) {
                    totalScore += (topPercentage * weights.top) + (flashPercentage * weights.flash);
                }
            }
        }
        calculatedAttributes[attr] = Math.min(totalScore, 10); // Cap at 10
    }

    

    // Calculate Technique based on standard deviation of top% across styles
    const styleTopPercentages = [];
    for (const style in styleGradeTotals) {
        if (style === 'Ladder') continue; // Exclude Ladder style

        let totalTopsForStyle = 0;
        let totalBouldersForStyle = 0;

        for (const grade in styleGradeTotals[style]) {
            totalTopsForStyle += styleGradeTotals[style][grade].tops;
            totalBouldersForStyle += styleGradeTotals[style][grade].totalBoulders;
        }

        if (totalBouldersForStyle > 0) {
            styleTopPercentages.push(totalTopsForStyle / totalBouldersForStyle);
        }
    }

    let technique = 0;
    if (styleTopPercentages.length > 0) {
        const meanStyleTop = styleTopPercentages.reduce((a, b) => a + b, 0) / styleTopPercentages.length;
        const stdDevStyleTop = Math.sqrt(styleTopPercentages.map(x => Math.pow(x - meanStyleTop, 2)).reduce((a, b) => a + b, 0) / styleTopPercentages.length);
        // Scale to 0-10, assuming max std dev is 0.5 (since percentages are 0-1)
        technique = (1 - (stdDevStyleTop / 0.35)) * 10; 
        technique = Math.max(0, technique); // Ensure technique score is not negative
    }

    const readingScore = totalToppedGrade > 0 ? (totalFlashedGrade / totalToppedGrade) * 10 : 0;

    

    return {
        power: calculatedAttributes.Power || 0,
        fingers: calculatedAttributes.Fingers || 0,
        coordination: calculatedAttributes.Coordination || 0,
        balance: calculatedAttributes.Balance || 0,
        technique: technique || 0,
        reading: readingScore || 0,
    };
}