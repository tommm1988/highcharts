/* *
 *
 *  Data Layer
 *
 *  (c) 2012-2020 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

/* *
 *
 *  Declarations
 *
 * */

/**
 * All possible keys of the class registry.
 */
export type ModifierName = keyof ModifierTypeRegistry;

/**
 * All possible types of the class registry.
 */
export type ModifierType = ModifierTypeRegistry[ModifierName];

/**
 * Describes the class registry as a record object with class name and their
 * class types (aka class constructor).
 */
export interface ModifierTypeRegistry {
    // nothing here yet
}

/* *
 *
 *  Export
 *
 * */

export default ModifierType;
