/**
 * The means by which selector grammar is combined.
 */
export enum Combinator {
  LIST = ",",
  CHILD = ">",
  NEXT = "+",
  SUBSEQUENT = "~",
  COLUMN = "||",
  DESCENDANT = " ",
}

/**
 * The method by which a given attribute is matched.
 */
export enum AttributeOperator {
  EQUALS = "=",
  IN_LIST = "~=",
  IN_TEXT = "*=",
  STARTS_WITH = "^=",
  ENDS_WITH = "$=",
}
