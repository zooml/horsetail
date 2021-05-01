import React from "react";
import clsx from "clsx";
import memoize from "memoize-one";

import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import { makeStyles } from "@material-ui/styles";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

// TODO data
import faker from "faker";
type IfRowData = {
  id: string,
  [key: string]: any
};
const createRow = (): IfRowData => ({
  id: faker.datatype.uuid(),
  product: faker.commerce.product(),
  price: faker.commerce.price(),
  calories: faker.datatype.number({ min: 0, max: 500 }),
  fat: faker.datatype.number({ min: 0, max: 50 }),
  carbs: faker.datatype.number({ min: 0, max: 50 }),
  protein: faker.datatype.number({ min: 0, max: 50 })
});
const createData = (qty = 200): IfRowData[] => {
  let data = [];
  for (let i = 0; i < qty; i++) {
    const row = createRow();
    data.push(row);
  }
  return data;
};
export const data = createData();
type IfColumn = {
  label: string,
  dataKey: string,
  numeric?: boolean,
  width?: number
};
export const columns: IfColumn[] = [
  {
    label: "Product",
    dataKey: "product"
    // width: 200
  },
  {
    label: "Price\u00A0($)",
    dataKey: "price",
    width: 120
  },
  {
    label: "Calories\u00A0(g)",
    dataKey: "calories",
    numeric: true,
    width: 120
  },
  {
    label: "Fat\u00A0(g)",
    dataKey: "fat",
    numeric: true,
    width: 120
  },
  {
    label: "Carbs\u00A0(g)",
    dataKey: "carbs",
    numeric: true,
    width: 120
  },
  {
    label: "Protein\u00A0(g)",
    dataKey: "protein",
    numeric: true,
    width: 120
  }
];

const useTableStyles = makeStyles(theme => ({
  root: {
    display: "block",
    flex: 1
  },
  table: {
    height: "100%",
    width: "100%"
  },
  list: {},
  thead: {},
  tbody: {
    width: "100%"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    boxSizing: "border-box",
    minWidth: "100%",
    width: "100%"
  },
  headerRow: {},
  cell: {
    display: "block",
    flexGrow: 0,
    flexShrink: 0
    // flex: 1
  },
  expandingCell: {
    flex: 1
  },
  column: {}
}));

type IfClasses = {
  row: string,
  headerRow: string
  cell: string,
  column: string,
  expandingCell: string
};

const TableColumns = ({ classes, columns }: { classes: IfClasses, columns: IfColumn[] }) => {
  return (
    <TableRow component="div" className={clsx(classes.row, classes.headerRow)}>
      {columns.map((column: IfColumn, colIndex: number) => {
        const tcstyle = {
          flexBasis: column.width || false,
          height: ROW_SIZE
        } as unknown as React.CSSProperties;
        return (
          <TableCell
            key={colIndex}
            component="div"
            variant="head"
            align={column.numeric || false ? "right" : "left"}
            className={clsx(
              classes.cell,
              classes.column,
              !column.width && classes.expandingCell
            )}
            style={tcstyle}
            scope="col"
          >
            {column.label}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

const ROW_SIZE = 48;

type IfRowProps = {
  index: number,
  style: React.CSSProperties,
  data: {
    columns: IfColumn[],
    items: IfRowData[],
    classes: IfClasses
  },

};

const Row = ({ index, style, data: { columns, items, classes } }: IfRowProps) => {
  const item = items[index];

  return (
    <TableRow component="div" className={classes.row} style={style}>
      {columns.map((column: IfColumn, colIndex: number) => {
        const tcstyle = {
          flexBasis: column.width || false,
          height: ROW_SIZE
        } as unknown as React.CSSProperties;
        return (
          <TableCell
            key={item.id + colIndex}
            component="div"
            variant="body"
            align={column.numeric || false ? "right" : "left"}
            className={clsx(
              classes.cell,
              !column.width && classes.expandingCell
            )}
            style={tcstyle}
          >
            {item[column.dataKey]}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

const itemKey = (index: number, data: {items: IfRowData[]}) => data.items[index].id;

const createItemData = memoize((classes, columns, data) => ({
  columns,
  classes,
  items: data
}));

//const DocumentsTable = ({ data, columns }) => {
const DocumentsTable = ({data, columns}: {data: IfRowData[], columns: IfColumn[]}) => {
  const classes = useTableStyles();
  const itemData = createItemData(classes, columns, data);

  return (
    <div className={classes.root}>
      <Table className={classes.table} component="div">
        <TableHead component="div" className={classes.thead}>
          <TableColumns classes={classes} columns={columns} />
        </TableHead>

        <TableBody component="div" className={classes.tbody}>
          <div style={{ flex: '1 1 auto' }}>
            <AutoSizer>
              {({ height, width }) => { // TODO remove {}
                return (
                <List
                  className={classes.list}
                  height={height}
                  width={width}
                  itemCount={data.length}
                  itemSize={ROW_SIZE}
                  itemKey={itemKey}
                  itemData={itemData}
                >
                  {Row}
                </List>
              );}}
            </AutoSizer>
          </div>
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTable;