let fs = require('fs');

function allCells() {
    let allCells = ``;
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            allCells += ` (and
${cellUnique(row, col)}
${hasSolution(row, col)}
${rowIsDistinct(row,col)}
${colDistinct(row,col)}
)`;
        }
    }
    return `(and${allCells})`;
}
// console.log(allCells());

function hasSolution(row, col) {
    let hasSolution = ``;
    for (let val = 1; val <= 9; val++) {
        hasSolution += ` c${row}${col}${val}`;
    }
    return `(or${hasSolution})`;
}
// console.log(hasSolution(7,6));

function cellUnique(row, col) {
    let cellUnique = ``;
    for (let val = 1; val <= 9; val++) {
        let cellNotVal = ``;
        for (let oVal = 1; oVal <= 9; oVal++) {
            if (oVal !== val) {
                cellNotVal += ` (not c${row}${col}${oVal})`;
            }
        }
        cellUnique += ` (=> c${row}${col}${val} (and${cellNotVal}))
`;
    }
    return `(and
${cellUnique})`;
}
// console.log(cellUnique(2,3));

function rowIsDistinct(row, col) {
    let rowDistinct = ``;
    for (let val = 1; val <= 9; val++) {
        let rowNotVal = ``;
        for (let oCol = 1; oCol <= 9; oCol++) {
            if (oCol !== col) {
                rowNotVal += ` (not c${row}${oCol}${val})`;
            }
        }
        rowDistinct += ` (=> c${row}${col}${val} (and${rowNotVal}))
`;
    }
    return `(and
${rowDistinct})`
}
// console.log(rowIsDistinct(2,3));

function colDistinct(row, col) {
    let colDistinct = ``;
    for (let val = 1; val <= 9; val++) {
        let colNotVal = ``;
        for (let oRow = 1; oRow <= 9; oRow++) {
            if (oRow !== row) {
                colNotVal += ` (not c${oRow}${col}${val})`;
            }
        }
        colDistinct += ` (=> c${row}${col}${val} (and${colNotVal}))
`;
    }
    return `(and
${colDistinct})`
}
// console.log(colDistinct(2,2));

function blockDistinct(blr, blc) {
    let blCellIsDistinct = ``;
    let blockRowOff = 3*(blr-1);
    let blockColOff = 3*(blc-1);
    for (let row = 1+blockRowOff; row <= 3+blockRowOff; row++) {
        for (let col = 1+blockColOff; col <= 3+blockColOff; col++) {
            for (let val = 1; val <= 9; val++) {
                let otherBlCellNotVal = ``;
                for (let oRow = 1+blockRowOff; oRow <= 3+blockRowOff; oRow++) {
                    for (let oCol = 1+blockColOff; oCol <= 3+blockColOff; oCol++) {
                        if (row !== oRow || col !== oCol) {
                            otherBlCellNotVal += ` (not c${oRow}${oCol}${val})`;
                        }
                    }
                }
                blCellIsDistinct += ` (=> c${row}${col}${val} (and${otherBlCellNotVal}))
`;
            }
        }
    }
    return `(and
${blCellIsDistinct})`;
}
// console.log(blockDistinct(3,3));

function allBlocksDistinct() {
    let allBlocksDistinct = ``;
    for (let blr = 1; blr <= 3; blr++) {
        for (let blc = 1; blc <=3; blc++) {
            allBlocksDistinct += ` ${blockDistinct(blr, blc)}
`;
        }
    }
    return `(and
${allBlocksDistinct})`;
}
// console.log(allBlocksDistinct());

function declareCells() {
    let declare = ``;
    for (let row = 1; row <= 9; row++) {
        for (let col = 1; col <= 9; col++) {
            for (let val = 1; val <=9; val++) {
                declare += `(declare-const c${row}${col}${val} Bool)
`;
            }
        }
    }
    return declare;
}
// console.log(declareCells());

function filledIn() {
    return `(and
c121 c144 c162 c185
c215 c296
c343 c361
c417 c435 c474 c498
c612 c638 c675 c699
c749 c766
c816 c892
c927 c941 c963 c984)`;
}

function sudoku() {
    return `${declareCells()}
(define-fun sudoku () Bool
(and
${allCells()}
${allBlocksDistinct()}
${filledIn()}
))
(assert sudoku)
(check-sat)
(get-model)
`;
}
// console.log(sudoku());

let stream = fs.createWriteStream('sudoku.z3');
stream.once('open', () => {
    stream.write(sudoku());
    stream.end();
});
