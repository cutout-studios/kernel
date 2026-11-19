export enum Combinator {
  LIST = ",",
  CHILD = ">",
  NEXT = "+",
  SUBSEQUENT = "~",
  COLUMN = "||",
  DESCENDANT = " ",
}

export enum AttributeOperator {
  EQUALS = "=",
  IN_LIST = "~=",
  IN_TEXT = "*=",
  STARTS_WITH = "^=",
  ENDS_WITH = "$=",
}
