// Copyright (c) 2012 The Chromium OS Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

lib.rtdep('lib.f',
          'hterm.RowCol', 'hterm.Size', 'hterm.TextAttributes');

/**
 * @fileoverview This class represents a single terminal screen full of text.
 *
 * It maintains the current cursor position and has basic methods for text
 * insert and overwrite, and adding or removing rows from the screen.
 *
 * This class has no knowledge of the scrollback buffer.
 *
 * The number of rows on the screen is determined only by the number of rows
 * that the caller inserts into the screen.  If a caller wants to ensure a
 * constant number of rows on the screen, it's their responsibility to remove a
 * row for each row inserted.
 *
 * The screen width, in contrast, is enforced locally.
 *
 *
 * In practice...
 * - The hterm.Terminal class holds two hterm.Screen instances.  One for the
 * primary screen and one for the alternate screen.
 *
 * - The html.Screen class only cares that rows are HTMLElements.  In the
 * larger context of hterm, however, the rows happen to be displayed by an
 * hterm.ScrollPort and have to follow a few rules as a result.  Each
 * row must be rooted by the custom HTML tag 'x-row', and each must have a
 * rowIndex property that corresponds to the index of the row in the context
 * of the scrollback buffer.  These invariants are enforced by hterm.Terminal
 * because that is the class using the hterm.Screen in the context of an
 * hterm.ScrollPort.
 */

/**
 * Create a new screen instance.
 *
 * The screen initially has no rows and a maximum column count of 0.
 *
 * @param {integer} opt_columnCount The maximum number of columns for this
 *    screen.  See insertString() and overwriteString() for information about
 *    what happens when too many characters are added too a row.  Defaults to
 *    0 if not provided.
 */
hterm.Screen = function(opt_columnCount) {
  /**
   * Public, read-only access to the rows in this screen.
   */
  this.rowsArray = [];

  // The max column width for this screen.
  this.columnCount_ = opt_columnCount || 80;

  // The current color, bold, underline and blink attributes.
  this.textAttributes = new hterm.TextAttributes(window.document);

  // Current zero-based cursor coordinates.
  this.cursorPosition = new hterm.RowCol(0, 0);

  // The node containing the row that the cursor is positioned on.
  this.cursorRowNode_ = null;

  // The node containing the span of text that the cursor is positioned on.
  this.cursorNode_ = null;

  // The offset into cursorNode_ where the cursor is positioned.
  this.cursorOffset_ = null;
};

/**
 * Return the screen size as an hterm.Size object.
 *
 * @return {hterm.Size} hterm.Size object representing the current number
 *     of rows and columns in this screen.
 */
hterm.Screen.prototype.getSize = function() {
  return new hterm.Size(this.columnCount_, this.rowsArray.length);
};

/**
 * Return the current number of rows in this screen.
 *
 * @return {integer} The number of rows in this screen.
 */
hterm.Screen.prototype.getHeight = function() {
  return this.rowsArray.length;
};

/**
 * Return the current number of columns in this screen.
 *
 * @return {integer} The number of columns in this screen.
 */
hterm.Screen.prototype.getWidth = function() {
  return this.columnCount_;
};

/**
 * Set the maximum number of columns per row.
 *
 * @param {integer} count The maximum number of columns per row.
 */
hterm.Screen.prototype.setColumnCount = function(count) {
  this.columnCount_ = count;

  if (this.cursorPosition.column >= count)
    this.setCursorPosition(this.cursorPosition.row, count - 1);
};

/**
 * Remove the first row from the screen and return it.
 *
 * @return {HTMLElement} The first row in this screen.
 */
hterm.Screen.prototype.shiftRow = function() {
  return this.shiftRows(1)[0];
};

/**
 * Remove rows from the top of the screen and return them as an array.
 *
 * @param {integer} count The number of rows to remove.
 * @return {Array.<HTMLElement>} The selected rows.
 */
hterm.Screen.prototype.shiftRows = function(count) {
  return this.rowsArray.splice(0, count);
};

/**
 * Insert a row at the top of the screen.
 *
 * @param {HTMLElement} The row to insert.
 */
hterm.Screen.prototype.unshiftRow = function(row) {
  this.rowsArray.splice(0, 0, row);
};

/**
 * Insert rows at the top of the screen.
 *
 * @param {Array.<HTMLElement>} The rows to insert.
 */
hterm.Screen.prototype.unshiftRows = function(rows) {
  this.rowsArray.unshift.apply(this.rowsArray, rows);
};

/**
 * Remove the last row from the screen and return it.
 *
 * @return {HTMLElement} The last row in this screen.
 */
hterm.Screen.prototype.popRow = function() {
  return this.popRows(1)[0];
};

/**
 * Remove rows from the bottom of the screen and return them as an array.
 *
 * @param {integer} count The number of rows to remove.
 * @return {Array.<HTMLElement>} The selected rows.
 */
hterm.Screen.prototype.popRows = function(count) {
  return this.rowsArray.splice(this.rowsArray.length - count, count);
};

/**
 * Insert a row at the bottom of the screen.
 *
 * @param {HTMLElement} The row to insert.
 */
hterm.Screen.prototype.pushRow = function(row) {
  this.rowsArray.push(row);
};

/**
 * Insert rows at the bottom of the screen.
 *
 * @param {Array.<HTMLElement>} The rows to insert.
 */
hterm.Screen.prototype.pushRows = function(rows) {
  rows.push.apply(this.rowsArray, rows);
};

/**
 * Insert a row at the specified column of the screen.
 *
 * @param {HTMLElement} The row to insert.
 */
hterm.Screen.prototype.insertRow = function(index, row) {
  this.rowsArray.splice(index, 0, row);
};

/**
 * Insert rows at the specified column of the screen.
 *
 * @param {Array.<HTMLElement>} The rows to insert.
 */
hterm.Screen.prototype.insertRows = function(index, rows) {
  for (var i = 0; i < rows.length; i++) {
    this.rowsArray.splice(index + i, 0, rows[i]);
  }
};

/**
 * Remove a last row from the specified column of the screen and return it.
 *
 * @return {HTMLElement} The selected row.
 */
hterm.Screen.prototype.removeRow = function(index) {
  return this.rowsArray.splice(index, 1)[0];
};

/**
 * Remove rows from the bottom of the screen and return them as an array.
 *
 * @param {integer} count The number of rows to remove.
 * @return {Array.<HTMLElement>} The selected rows.
 */
hterm.Screen.prototype.removeRows = function(index, count) {
  return this.rowsArray.splice(index, count);
};

/**
 * Invalidate the current cursor position.
 *
 * This sets this.cursorPosition to (0, 0) and clears out some internal
 * data.
 *
 * Attempting to insert or overwrite text while the cursor position is invalid
 * will raise an obscure exception.
 */
hterm.Screen.prototype.invalidateCursorPosition = function() {
  this.cursorPosition.move(0, 0);
  this.cursorRowNode_ = null;
  this.cursorNode_ = null;
  this.cursorOffset_ = null;
};

/**
 * Clear the contents of the cursor row.
 */
hterm.Screen.prototype.clearCursorRow = function() {
  this.cursorRowNode_.innerHTML = '';
  this.cursorRowNode_.removeAttribute('line-overflow');
  this.cursorOffset_ = 0;
  this.cursorPosition.column = 0;
  this.cursorPosition.overflow = false;

  var text;
  if (this.textAttributes.isDefault()) {
    text = '';
  } else {
    text = lib.f.getWhitespace(this.columnCount_);
  }

  var node = this.textAttributes.createContainer(text);
  this.cursorRowNode_.appendChild(node);
  this.cursorNode_ = node;
};

/**
 * Mark the current row as having overflowed to the next line.
 *
 * The line overflow state is used when converting a range of rows into text.
 * It makes it possible to recombine two or more overflow terminal rows into
 * a single line.
 *
 * This is distinct from the cursor being in the overflow state.  Cursor
 * overflow indicates that printing at the cursor position will commit a
 * line overflow, unless it is preceded by a repositioning of the cursor
 * to a non-overflow state.
 */
hterm.Screen.prototype.commitLineOverflow = function() {
  this.cursorRowNode_.setAttribute('line-overflow', true);
};

/**
 * Relocate the cursor to a give row and column.
 *
 * @param {integer} row The zero based row.
 * @param {integer} column The zero based column.
 */
hterm.Screen.prototype.setCursorPosition = function(row, column) {
  if (!this.rowsArray.length) {
    console.warn('Attempt to set cursor position on empty screen.');
    return;
  }

  if (row >= this.rowsArray.length) {
    console.error('Row out of bounds: ' + row);
    row = this.rowsArray.length - 1;
  } else if (row < 0) {
    console.error('Row out of bounds: ' + row);
    row = 0;
  }

  if (column >= this.columnCount_) {
    console.error('Column out of bounds: ' + column);
    column = this.columnCount_ - 1;
  } else if (column < 0) {
    console.error('Column out of bounds: ' + column);
    column = 0;
  }

  this.cursorPosition.overflow = false;

  var rowNode = this.rowsArray[row];
  var node = rowNode.firstChild;

  if (!node) {
    node = rowNode.ownerDocument.createTextNode('');
    rowNode.appendChild(node);
  }

  var currentColumn = 0;

  if (rowNode == this.cursorRowNode_) {
    if (column >= this.cursorPosition.column - this.cursorOffset_) {
      node = this.cursorNode_;
      currentColumn = this.cursorPosition.column - this.cursorOffset_;
    }
  } else {
    this.cursorRowNode_ = rowNode;
  }

  this.cursorPosition.move(row, column);

  while (node) {
    var offset = column - currentColumn;
    var textContent = node.textContent;
    if (!node.nextSibling || textContent.length > offset) {
      this.cursorNode_ = node;
      this.cursorOffset_ = offset;
      return;
    }

    currentColumn += textContent.length;
    node = node.nextSibling;
  }
};

/**
 * Set the provided selection object to be a caret selection at the current
 * cursor position.
 */
hterm.Screen.prototype.syncSelectionCaret = function(selection) {
  // This crashed all the time because the cursor offset, looking at the docs
  // for Selection.collapse, the offset value can only be 0/1. And setting it
  // to 0 seems to work well(we had an issue where cursoring over quoted text
  // in vim would make the cursor disappear).
  //selection.collapse(this.cursorNode_, this.cursorOffset_);
  selection.collapse(this.cursorNode_, 0);
};

/**
 * Split a single node into two nodes at the given offset.
 *
 * For example:
 * Given the DOM fragment '<div><span>Hello World</span></div>', call splitNode_
 * passing the span and an offset of 6.  This would modifiy the fragment to
 * become: '<div><span>Hello </span><span>World</span></div>'.  If the span
 * had any attributes they would have been copied to the new span as well.
 *
 * The to-be-split node must have a container, so that the new node can be
 * placed next to it.
 *
 * @param {HTMLNode} node The node to split.
 * @param {integer} offset The offset into the node where the split should
 *     occur.
 */
hterm.Screen.prototype.splitNode_ = function(node, offset) {
  var afterNode = node.cloneNode(false);

  var textContent = node.textContent;
  node.textContent = textContent.substr(0, offset);
  afterNode.textContent = textContent.substr(offset);

  node.parentNode.insertBefore(afterNode, node.nextSibling);
};

/**
 * Ensure that text is clipped and the cursor is clamped to the column count.
 */
hterm.Screen.prototype.maybeClipCurrentRow = function() {
  if (this.cursorRowNode_.textContent.length <= this.columnCount_) {
    // Current row does not need clipping, but may need clamping.
    if (this.cursorPosition.column >= this.columnCount_) {
      this.setCursorPosition(this.cursorPosition.row, this.columnCount_ - 1);
      this.cursorPosition.overflow = true;
    }

    return;
  }

  // Save off the current column so we can maybe restore it later.
  var currentColumn = this.cursorPosition.column;

  // Move the cursor to the final column.
  this.setCursorPosition(this.cursorPosition.row, this.columnCount_ - 1);

  // Remove any text that partially overflows.
  var cursorNodeText = this.cursorNode_.textContent;
  if (this.cursorOffset_ < cursorNodeText.length - 1) {
    this.cursorNode_.textContent = cursorNodeText.substr(
        0, this.cursorOffset_ + 1);
  }

  // Remove all nodes after the cursor.
  var rowNode = this.cursorRowNode_;
  var node = this.cursorNode_.nextSibling;

  while (node) {
    rowNode.removeChild(node);
    node = this.cursorNode_.nextSibling;
  }

  if (currentColumn < this.columnCount_) {
    // If the cursor was within the screen before we started then restore its
    // position.
    this.setCursorPosition(this.cursorPosition.row, currentColumn);
  } else {
    // Otherwise leave it at the the last column in the overflow state.
    this.cursorPosition.overflow = true;
  }
};

/**
 * Insert a string at the current character position using the current
 * text attributes.
 *
 * You must call maybeClipCurrentRow() after in order to clip overflowed
 * text and clamp the cursor.
 *
 * It is also up to the caller to properly maintain the line overflow state
 * using hterm.Screen..commitLineOverflow().
 */
hterm.Screen.prototype.insertString = function(str) {
  var cursorNode = this.cursorNode_;
  var cursorNodeText = cursorNode.textContent;

  // We may alter the length of the string by prepending some missing
  // whitespace, so we need to record the string length ahead of time.
  var strLength = str.length;

  // No matter what, before this function exits the cursor column will have
  // moved this much.
  this.cursorPosition.column += strLength;

  // Local cache of the cursor offset.
  var offset = this.cursorOffset_;

  // Reverse offset is the offset measured from the end of the string.
  // Zero implies that the cursor is at the end of the cursor node.
  var reverseOffset = cursorNodeText.length - offset

  if (reverseOffset < 0) {
    // A negative reverse offset means the cursor is positioned past the end
    // of the characters on this line.  We'll need to insert the missing
    // whitespace.
    var ws = lib.f.getWhitespace(-reverseOffset);

    // This whitespace should be completely unstyled.  Underline and background
    // color would be visible on whitespace, so we can't use one of those
    // spans to hold the text.
    if (!(this.textAttributes.underline || this.textAttributes.background)) {
      // Best case scenario, we can just pretend the spaces were part of the
      // original string.
      str = ws + str;
    } else if (cursorNode.nodeType == 3 ||
               !(cursorNode.style.textDecoration ||
                 cursorNode.style.backgroundColor)) {
      // Second best case, the current node is able to hold the whitespace.
      cursorNode.textContent = (cursorNodeText += ws);
    } else {
      // Worst case, we have to create a new node to hold the whitespace.
      var wsNode = cursorNode.ownerDocument.createTextNode(ws);
      this.cursorRowNode_.insertBefore(wsNode, cursorNode.nextSibling);
      this.cursorNode_ = cursorNode = wsNode;
      this.cursorOffset_ = offset = -reverseOffset;
      cursorNodeText = ws;
    }

    // We now know for sure that we're at the last character of the cursor node.
    reverseOffset = 0;
  }

  if (this.textAttributes.matchesContainer(cursorNode)) {
    // The new text can be placed directly in the cursor node.
    if (reverseOffset == 0) {
      cursorNode.textContent = cursorNodeText + str;
    } else if (offset == 0) {
      cursorNode.textContent = str + cursorNodeText;
    } else {
      cursorNode.textContent = cursorNodeText.substr(0, offset) + str +
          cursorNodeText.substr(offset);
    }

    this.cursorOffset_ += strLength;
    return;
  }

  // The cursor node is the wrong style for the new text.  If we're at the
  // beginning or end of the cursor node, then the adjacent node is also a
  // potential candidate.

  if (offset == 0) {
    // At the beginning of the cursor node, the check the previous sibling.
    var previousSibling = cursorNode.previousSibling;
    if (previousSibling &&
        this.textAttributes.matchesContainer(previousSibling)) {
      previousSibling.textContent += str;
      this.cursorNode_ = previousSibling;
      this.cursorOffset_ = previousSibling.textContent.length;
      return;
    }

    var newNode = this.textAttributes.createContainer(str);
    this.cursorRowNode_.insertBefore(newNode, cursorNode);
    this.cursorNode_ = newNode;
    this.cursorOffset_ = strLength;
    return;
  }

  if (reverseOffset == 0) {
    // At the end of the cursor node, the check the next sibling.
    var nextSibling = cursorNode.nextSibling;
    if (nextSibling &&
        this.textAttributes.matchesContainer(nextSibling)) {
      nextSibling.textContent = str + nextSibling.textContent;
      this.cursorNode_ = nextSibling;
      this.cursorOffset_ = strLength;
      return;
    }

    var newNode = this.textAttributes.createContainer(str);
    this.cursorRowNode_.insertBefore(newNode, nextSibling);
    this.cursorNode_ = newNode;
    // We specifically need to include any missing whitespace here, since it's
    // going in a new node.
    this.cursorOffset_ = str.length;
    return;
  }

  // Worst case, we're somewhere in the middle of the cursor node.  We'll
  // have to split it into two nodes and insert our new container in between.
  this.splitNode_(cursorNode, offset);
  var newNode = this.textAttributes.createContainer(str);
  this.cursorRowNode_.insertBefore(newNode, cursorNode.nextSibling);
  this.cursorNode_ = newNode;
  this.cursorOffset_ = strLength;
};

/**
 * Overwrite the text at the current cursor position.
 *
 *
 * You must call maybeClipCurrentRow() after in order to clip overflowed
 * text and clamp the cursor.
 *
 * It is also up to the caller to properly maintain the line overflow state
 * using hterm.Screen..commitLineOverflow().
 */
hterm.Screen.prototype.overwriteString = function(str) {
  var maxLength = this.columnCount_ - this.cursorPosition.column;
  if (!maxLength)
    return [str];

  if ((this.cursorNode_.textContent.substr(this.cursorOffset_) == str) &&
      this.textAttributes.matchesContainer(this.cursorNode_)) {
    // This overwrite would be a no-op, just move the cursor and return.
    this.cursorOffset_ += str.length;
    this.cursorPosition.column += str.length;
    return;
  }

  this.deleteChars(Math.min(str.length, maxLength));
  this.insertString(str);
};

/**
 * Forward-delete one or more characters at the current cursor position.
 *
 * Text to the right of the deleted characters is shifted left.  Only affects
 * characters on the same row as the cursor.
 *
 * @param {integer} count The number of characters to delete.  This is clamped
 *     to the column width minus the cursor column.
 * @return {integer} The number of characters actually deleted.
 */
hterm.Screen.prototype.deleteChars = function(count) {
  var node = this.cursorNode_;
  var offset = this.cursorOffset_;
  var textContent = node.textContent;

  var currentCursorColumn = this.cursorPosition.column;
  count = Math.min(count, this.columnCount_ - currentCursorColumn);
  if (!count)
    return 0;

  var rv = count;

  while (node && count) {
    var startLength = textContent.length;

    textContent = textContent.substr(0, offset) +
        textContent.substr(offset + count);

    var endLength = textContent.length;
    count -= startLength - endLength;

    if (endLength == 0 && node != this.cursorNode_) {
      var nextNode = node.nextSibling;
      node.parentNode.removeChild(node);
      node = nextNode;
    } else {
      node.textContent = textContent;
      node = node.nextSibling;
    }

    if (node)
      textContent = node.textContent;

    offset = 0;
  }

  return rv;
};
