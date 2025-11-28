export interface IGetAllOptions {
  // Important: If used, the filter property names must exist on the corresponding model interface.
  // The year(), month(), day(), hour(), minute(), second(), date(), now() OData functions are not supported.
  // dateProperty eq <some date value> is not supported. Use dateProperty ge <some date value> and dateProperty lt <some date value + 1 day> instead. To add days to a date, use the addDays() function from the date-fns library.
  // Date properties do not support OData string functions like startsWith()
  // For lookup properties like "studentName: Pick<Student, 'id' | 'studentName'>;" the filter clause format is:
  //   - studentName/id eq 'guid-value'
  //   - studentName/studentName eq 'display-name'
  //   - studentName/id eq 'guid-value' or studentName/studentName eq 'display-name'
  // Navigation is limited to 2 levels maximum (entity/property). Multi-level navigation like 'studentName/relatedEntity/someProperty' is not supported.
  filter?: string;
  // Important: If used, the orderBy property names must exist on the corresponding model interface.
  // Only supports the following formats per entry:
  //   - propertyName
  //   - propertyName asc
  //   - propertyName desc
  // For lookup properties like "studentName: Pick<Student, 'id' | 'studentName'>;" the orderBy clause format is: studentName/id or studentName/studentName
  orderBy?: string[];
}
