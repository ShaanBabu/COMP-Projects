
# Written by Shaan Babu | z5280731
# Program description: A game of battleship takes place over a number of turns, as two players battle it out to sink each other's ships!
# The code below contains multiple functions encoded in MIPS that allows two user to play the game correctly. 

########################################################################
# COMP1521 22T3 -- Assignment 1 -- Battlesmips!
#
#
# !!! IMPORTANT !!!
# Before starting work on the assignment, make sure you set your tab-width to 8!
# It is also suggested to indent with tabs only.
# Instructions to configure your text editor can be found here:
#   https://cgi.cse.unsw.edu.au/~cs1521/22T3/resources/mips-editors.html
# !!! IMPORTANT !!!
#
# A simplified implementation of the classic board game battleship!
# This program was written by <YOUR-NAME-HERE> (YOUR-ZID-HERE)
# on DATE-FINISHED-HERE
#
# Version 1.0 (2022/10/04): Team COMP1521 <cs1521@cse.unsw.edu.au>
#
################################################################################

#![tabsize(8)]

# Constant definitions.
# DO NOT CHANGE THESE DEFINITIONS

# True and False constants
TRUE			= 1
FALSE			= 0
INVALID			= -1

# Board dimensions
BOARD_SIZE		= 7

# Bomb cell types
EMPTY			= '-'
HIT			= 'X'
MISS			= 'O'

# Ship cell types
CARRIER_SYMBOL		= 'C'
BATTLESHIP_SYMBOL	= 'B'
DESTROYER_SYMBOL	= 'D'
SUBMARINE_SYMBOL	= 'S'
PATROL_BOAT_SYMBOL	= 'P'

# Ship lengths
CARRIER_LEN		= 5
BATTLESHIP_LEN		= 4
DESTROYER_LEN		= 3
SUBMARINE_LEN		= 3
PATROL_BOAT_LEN		= 2

# Players
BLUE			= 'B'
RED			= 'R'

# Direction inputs
UP			= 'U'
DOWN			= 'D'
LEFT			= 'L'
RIGHT			= 'R'

# Winners
WINNER_NONE		= 0
WINNER_RED		= 1
WINNER_BLUE		= 2


################################################################################
# DATA SEGMENT
# DO NOT CHANGE THESE DEFINITIONS
.data

# char blue_board[BOARD_SIZE][BOARD_SIZE];
blue_board:			.space  BOARD_SIZE * BOARD_SIZE

# char red_board[BOARD_SIZE][BOARD_SIZE];
red_board:			.space  BOARD_SIZE * BOARD_SIZE

# char blue_view[BOARD_SIZE][BOARD_SIZE];
blue_view:			.space  BOARD_SIZE * BOARD_SIZE

# char red_view[BOARD_SIZE][BOARD_SIZE];
red_view:			.space  BOARD_SIZE * BOARD_SIZE

# char whose_turn = BLUE;
whose_turn:			.byte   BLUE

# point_t target;
.align 2
target:						# struct point target {
				.space  4	# 	int row;
				.space  4	# 	int col;
						# }

# point_t start;
.align 2
start:						# struct point start {
				.space  4	# 	int row;
				.space  4	# 	int col;
						# }

# point_t end;
.align 2
end:						# struct point end {
				.space  4	# 	int row;
				.space  4	# 	int col;
						# }

# Strings
red_player_name_str:		.asciiz "RED"
blue_player_name_str:		.asciiz "BLUE"
place_ships_str:		.asciiz ", place your ships!\n"
your_final_board_str:		.asciiz ", Your final board looks like:\n\n"
red_wins_str:			.asciiz "RED wins!\n"
blue_wins_str:			.asciiz "BLUE wins!\n"
red_turn_str:			.asciiz "It is RED's turn!\n"
blue_turn_str:			.asciiz "It is BLUE's turn!\n"
your_curr_board_str:		.asciiz "Your current board:\n"
ship_input_info_1_str:		.asciiz "Placing ship type "
ship_input_info_2_str:		.asciiz ", with length "
ship_input_info_3_str:		.asciiz ".\n"
enter_start_row_str:		.asciiz "Enter starting row: "
enter_start_col_str:		.asciiz "Enter starting column: "
enter_direction_str:		.asciiz "Enter direction (U, D, L, R): "
invalid_direction_str:		.asciiz "Invalid direction. Try again.\n"
invalid_length_str:		.asciiz "Ship doesn't fit in this direction. Try again.\n"
invalid_overlaps_str:		.asciiz "Ship overlaps with another ship. Try again.\n"
invalid_coords_already_hit_str:	.asciiz "You've already hit this target. Try again.\n"
invalid_coords_out_bounds_str:	.asciiz "Coordinates out of bounds. Try again.\n"
enter_row_target_str:		.asciiz "Please enter the row for your target: "
enter_col_target_str:		.asciiz "Please enter the column for your target: "
hit_successful_str: 		.asciiz "Successful hit!\n"
you_missed_str:			.asciiz "Miss!\n"


############################################################
####                                                    ####
####   Your journey begins here, intrepid adventurer!   ####
####                                                    ####
############################################################


################################################################################
#
# Implement the following functions,
# and check these boxes as you finish implementing each function.
#
#  - [ ] main
#  - [ ] initialise_boards
#  - [ ] initialise_board
#  - [ ] setup_boards
#  - [ ] setup_board
#  - [ ] place_ship
#  - [ ] is_coord_out_of_bounds
#  - [ ] is_overlapping
#  - [ ] place_ship_on_board
#  - [ ] play_game
#  - [ ] play_turn
#  - [ ] perform_hit
#  - [ ] check_player_win
#  - [ ] check_winner
#  - [X] print_board			(provided for you)
#  - [X] swap_turn			(provided for you)
#  - [X] get_end_row			(provided for you)
#  - [X] get_end_col			(provided for you)
################################################################################

################################################################################
# .TEXT <main>
.text
main:
	# Args:     void
	#
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra]
	# Uses:     []
	# Clobbers: []
	#
	# Locals:
	#
	# Structure:
	#   main
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

main__prologue:
	begin			
	push	$ra

main__body:
	# TODO: add your code for the `main` function here
	jal 	initialise_boards				# initialise_boards();
	jal 	setup_boards					# setup_boards();
	jal 	play_game					# play_game();

main__epilogue:
	pop	$ra						# | $ra
	end							# ends the current stack frame

	li	$v0, 0
	jr	$ra						# return 0;


################################################################################
# .TEXT <initialise_boards>
# Each board provided is passed into initialise_board function to be written as EMPTY
.text
initialise_boards:
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $t0, $t1, $t2, $t3]
	# Clobbers: [$a0]
	#
	# Locals:
	#   - $t0: blue_board
	#   - $t1: blue_view
	#   - $t2: red_board
	#   - $t3: red_view 	
	# Structure:
	#   initialise_boards
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

initialise_boards__prologue:
	begin
	push 	$ra						# push $ra into stack

initialise_boards__body:
	
	la	$t0, blue_board					# initialise_board(blue_board);			
	move 	$a0, $t0
	jal 	initialise_board
	
	la 	$t1, blue_view					# initialise_board(blue_view);
	move 	$a0, $t1
	jal 	initialise_board

	la 	$t2, red_board					# initialise_board(red_board);
	move 	$a0, $t2
	jal 	initialise_board

	la 	$t3, red_view					# initialise_board(red_view);
	move 	$a0, $t3
	jal 	initialise_board

initialise_boards__epilogue:
	pop 	$ra						# pop $ra out of stack	
	end

	jr	$ra						# return;


################################################################################
# .TEXT <initialise_board>
# Starting board is intialised with correct row x col to be EMPTY
.text
initialise_board:
	# Args:
        #   - $a0: char[BOARD_SIZE][BOARD_SIZE] board
	#
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$t0, $t1, $t2, $t3]
	# Clobbers: [$t0, $t1, $t2, $t3]
	#
	# Locals:
	#   - $t0: row
	#   - $t1: col
	#   - $t2: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $t3: stored array ([BOARD_SIZE][BOARD_SIZE] board))
	#
	# Structure:
	#   initialise_board
	#   -> [prologue]
	#   -> body
	#		-> initialise_board_body
	#		-> initialise_board_loop
	#		-> initialise_board_inner_loop
	#		-> row_increment
	#   -> [epilogue]

initialise_board__prologue:

	begin
	push 	$ra
	
initialise_board__body:
	# TODO: add your code for the `initialise_board` function here
	# move $s2, $a0
	li 	$t0, 0						# int row = 0;

initialise_board_loop:

	bge 	$t0, BOARD_SIZE, initialise_board__epilogue	# if (row >= BOARD_SIZE); go to initialise_board__epilogue
	li 	$t1, 0						# int col = 0;

initialise_board_inner_loop:
	bge 	$t1, BOARD_SIZE, row_increment			# if (col >= BOARD_SIZE); go to row_increment	

	mul 	$t2, $t0, BOARD_SIZE				# initialise array ($t2)	
	add 	$t2, $t2, $t1
	mul 	$t2, $t2, 1
	add 	$t2, $t2, $a0
	
	lb	$t3, ($t2)					# board[row][col] = EMPTY;
	li 	$t3, EMPTY
	sb 	$t3, ($t2)

	addi 	$t1, $t1, 1					# col++
	j 	initialise_board_inner_loop			# loop to start of inner loop

row_increment:

	addi 	$t0, $t0, 1					# row++
	j 	initialise_board_loop				# loop to start of main loop	

initialise_board__epilogue:
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <setup_boards>
# board and player type is passed into setup_board function 
.text
setup_boards:
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra]
	# Uses:     [$a0, $a1]
	# Clobbers: []
	#
	# Locals:
	#
	# Structure:
	#   setup_boards
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

setup_boards__prologue:
	begin
	push 	$ra

setup_boards__body:
	
	la 	$a0, blue_board					# setup_board(blue_board, "BLUE");
	la 	$a1, blue_player_name_str
	jal 	setup_board

	la 	$a0, red_board					# setup_board(red_board,  "RED");
	la 	$a1, red_player_name_str
	jal 	setup_board

setup_boards__epilogue:
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <setup_board>
# ship types are passed into the place_ship function
.text
setup_board:
	# Args:
	#   - $a0: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $a1: char *player
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0, $s1]
	# Uses:     [$a0, $a1, $a2, $v0, $s0, $s1]
	# Clobbers: [$a0, $a1, $a2, $s0]
	#
	# Locals:
	#   - $s0: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $s1: char *player
	# Structure:
	#   setup_board
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

setup_board__prologue:
	begin
	push $ra
	push $s0						# $s0 = char[BOARD_SIZE][BOARD_SIZE] board
	push $s1						# $s1 = char *player

setup_board__body:
	# TODO: add your code for the `setup_board` function here
	
	move 	$s0, $a0					# $s0 = char[BOARD_SIZE][BOARD_SIZE] board
	move 	$s1, $a1					# $s1 = char *player

	move 	$a0, $a1					# printf("%s", player);
	li 	$v0, 4
	syscall

	la 	$a0, place_ships_str				# printf("place your ships!\n");
	li 	$v0, 4
	syscall

	move 	$a0, $s0					# place_ship(board, CARRIER_LEN, CARRIER_SYMBOL);
	la	$a1, CARRIER_LEN
	la 	$a2, CARRIER_SYMBOL
	jal 	place_ship

	move 	$a0, $s0					# place_ship(board, BATTLESHIP_LEN, BATTLESHIP_SYMBOL);
	la 	$a1, BATTLESHIP_LEN
	la 	$a2, BATTLESHIP_SYMBOL
	jal 	place_ship

	move 	$a0, $s0					# place_ship(board, DESTROYER_LEN, DESTROYER_SYMBOL);
	la 	$a1, DESTROYER_LEN
	la 	$a2, DESTROYER_SYMBOL
	jal 	place_ship

	move 	$a0, $s0					#  place_ship(board, SUBMARINE_LEN, SUBMARINE_SYMBOL);
	la 	$a1, SUBMARINE_LEN
	la 	$a2, SUBMARINE_SYMBOL
	jal 	place_ship

	move	$a0, $s0					# place_ship(board, PATROL_BOAT_LEN, PATROL_BOAT_SYMBOL);
	la 	$a1, PATROL_BOAT_LEN
	la 	$a2, PATROL_BOAT_SYMBOL
	jal 	place_ship

	move 	$a0, $s1					# printf("%s", player);
	li 	$v0, 4
	syscall

	la 	$a0, your_final_board_str			# printf("Your final board looks like:\n\n");
	li 	$v0, 4
	syscall
	
	move 	$a0, $s0					#  print_board(board);
	jal 	print_board


setup_board__epilogue:
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <place_ship>
# ship type with given length is placed onto the initialised board (for each player)
.text
place_ship:
	# Args:
	#   - $a0: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $a1: int  ship_len
	#   - $a2: char ship_type
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4, $s5, $s6, $s7]
	# Uses:     [$a0, $a1, $a2, $v0, $s0, $s1, $s2, $s3, $s4, $s5, $s6, $s7, $t0, $t2, $t3, $t5, $t6, $t7]
	# Clobbers: [$a0, $a1, $a2, $v0, $t0, $t2, $t3, $t5, $t6]
	#
	# Locals:
	#   - $s0: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $s1: start.row
	#   - $s2: start.col
	#   - $s3: direction_char
	#   - $s4: end.row
	#   - $s5: end.col
	#   - $s6: ship_len
	#   - $s7: ship_type
	#   - $t0: start[][]
	#   - $t2: return value from is_coord_out_of_bounds	
	#   - $t3: end[][]
	#   - $t5: return value from out_of_bounds
	#   - $t6: temp
	#   - $t7: return value from is_overlapping
	# Structure:
	#   place_ship
	#   -> [prologue]
	#   -> body
	#	-> place_ship_init
	#		-> place_ship__move_direction
	# 		-> place_ship__check_end_pos
	#		-> place_ship__position
	#		-> place_ship__vertical
	# 		-> place_ship__horizontal
	#		-> place_ship__check_overlap
	#	-> place_ship__call_function
	#   -> [epilogue]

place_ship__prologue:
	begin
	push 	$ra
	push 	$s0		# store board
	push 	$s1		# store start.row
	push 	$s2		# store start.col
	push	$s3 		# store direction_char
	push 	$s4		# store end.row
	push 	$s5		# store end.col
	push 	$s6		# store ship_len
	push 	$s7		# store ship_type

place_ship__body:
								
	move 	$s0, $a0					# $s0 = char[BOARD_SIZE][BOARD_SIZE] board
	move	$s6, $a1					# $s6 = ship_len
	move 	$s7, $a2					# $s7 = ship_type

place_ship_init:						# for (;;);

	la 	$a0, your_curr_board_str			# printf("Your current board:\n");
	li 	$v0, 4
	syscall

	move 	$a0, $s0					# print_board(board);
	jal 	print_board

	la 	$a0, ship_input_info_1_str			# printf("Placing ship type");
	li 	$v0, 4
	syscall

	move 	$a0, $s7					# printf("%c", ship_type);
	li 	$v0, 11
	syscall

	la 	$a0, ship_input_info_2_str			# printf("with length");
	li 	$v0, 4
	syscall

	move 	$a0, $s6					# printf("%d", ship_len);
	li 	$v0, 1
	syscall

	la 	$a0, ship_input_info_3_str			#printf(".\n");
	li 	$v0, 4
	syscall

	
	la 	$a0, enter_start_row_str			# printf("Enter starting row: ");
	li 	$v0, 4
	syscall

	li 	$v0, 5						# scanf("%d", &start.row);
	syscall
	move 	$s1, $v0					# $s1 = start.row


	la 	$t0, start					# store $s1 into start.row
	sw 	$s1, 0($t0)					

	la 	$a0, enter_start_col_str			# printf("Enter starting column: ");
	li 	$v0, 4
	syscall

	li	$v0, 5						# scanf("%d", &start.col);
	syscall
	move 	$s2, $v0

	la 	$t0, start					# store $s2 into start.col
	sw 	$s2, 4($t0)			
	
	
	move 	$a0, $t0					# is_coord_out_of_bounds(&start)
	jal 	is_coord_out_of_bounds				 
	move 	$t2, $v0					# t2 = return value from is_coord_out_of_bounds					


	beq 	$t2, FALSE, place_ship__move_direction 		# if ($t2 == FALSE) -> go to continue1

	la 	$a0, invalid_coords_out_bounds_str		# printf("Coordinates out of bounds. Try again.\n");
	li 	$v0, 4
	syscall

	j 	place_ship_init					# loop to start of place_ship_init

place_ship__move_direction:

	la 	$a0, enter_direction_str			# printf("Enter direction (U, D, L, R): ");
	li	$v0, 4
	syscall

	li 	$v0, 12						# scanf(" %c", &direction_char);
	syscall
	move 	$s3, $v0					# s3 = direction_char;

	la 	$t0, start					# store $s1 into start.row
	lw 	$s1, 0($t0)					

	move 	$a0, $s1					# get_end_row(start.row, direction_char, ship_len);
	move 	$a1, $s3								
	move 	$a2, $s6	
	jal 	get_end_row
	move 	$s4, $v0

	la 	$t3, end					# end.row = get_end_row(start.row, direction_char, ship_len);
	sw 	$s4, 0($t3)					# $s4 = end.row

	la 	$t0, start					# load $s2 from start.col
	lw 	$s2, 4($t0)							
		
	move 	$a0, $s2					# get_end_col(start.col, direction_char, ship_len);
	move 	$a1, $s3								
	move 	$a2, $s6								
	jal 	get_end_col
	move 	$s5, $v0									

	la 	$t3, end					# end.col = get_end_col(start.col, direction_char, ship_len);
	sw 	$s5, 4($t3)					# s5 = end.col
	
	bne 	$s4, INVALID, place_ship__check_end_pos		# if (end.row == INVALID || end.col == INVALID) {
	bne 	$s5, INVALID, place_ship__check_end_pos				

	la 	$a0, invalid_direction_str			# printf("Invalid direction. Try again.\n");
	li 	$v0, 4
	syscall

	j 	place_ship_init					# loop to start of place_ship_init		

place_ship__check_end_pos:

	move 	$a0, $t3					# is_coord_out_of_bounds(&end);
	jal 	is_coord_out_of_bounds
	move 	$t5, $v0					# $t5 = return value from out_of_bounds


	beq 	$t5, FALSE, place_ship__position 		#  if (is_coord_out_of_bounds(&end) == FALSE); go to place_ship__position

	la 	$a0, invalid_length_str				# printf("Ship doesn't fit in this direction. Try again.\n");
	li 	$v0, 4
	syscall
	
	j 	place_ship_init					# loop to start of place_ship_init

place_ship__position:
	
	la 	$t0, start
	lw 	$s1, 0($t0)					# $s1 = start.row
	
	la 	$t3, end
	lw 	$s4, 0($t3)					# $s4 = end.row
	
place_ship__vertical:

	bge 	$s4, $s1, place_ship__horizontal		# if (start.row >= end.row); go to end_of_if1
	
	move 	$t6, $s1					# int temp = start.row;
	move 	$s1, $s4					# start.row = end.row;
	sw 	$s1, 0($t0)					# store into $t0 (start array)
	move 	$s4, $t6					# end.row = temp;
	sw 	$s4, 0($t3)					# store into $t3 (end array)

place_ship__horizontal:
	
	la 	$t0, start					# load $s2 from start.col
	lw 	$s2, 4($t0)					

	la 	$t3, end					# load $s5 from end.col				
	lw 	$s5, 4($t3)							
	
	bge 	$s5, $s2, place_ship__check_overlap		# if (end.col >= start.col); go to place_ship__check_overlap

	move 	$t4, $s2					# int temp = start.col;
	move 	$s2, $s5					# start.col = end.col;
	sw 	$s2, 4($t0)
	move 	$s5, $t4					# end.col = temp;
	sw 	$s5, 4($t3)

place_ship__check_overlap:

	move 	$a0, $s0					# is_overlapping(board);
	jal 	is_overlapping
	move 	$t7, $v0

	
	bne 	$t7, TRUE, place_ship__call_function 		#  if (!is_overlapping(board)) { break }

	la 	$a0, invalid_overlaps_str			# printf("Ship overlaps with another ship. Try again.\n");
	li 	$v0, 4
	syscall

	j 	place_ship_init					# loop to start of place_ship_init

place_ship__call_function:

	move 	$a0, $s0					# place_ship_on_board(board, ship_type);
	move 	$a1, $s7
	jal 	place_ship_on_board

place_ship__epilogue:
	pop 	$s7
	pop 	$s6
	pop 	$s5
	pop 	$s4
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end
	
	jr	$ra						# return;

################################################################################
# .TEXT <is_coord_out_of_bounds>
# checks if coordinates (row/col) is within bounds of board
.text
is_coord_out_of_bounds:
	# Args:
	#   - $a0: point_t *coord
	#
	# Returns:
	#   - $v0: bool
	#
	# Frame:    [$ra, $s0, $s1]
	# Uses:     [$a0, $v0, $s0, $s1, $t0]
	# Clobbers: [$v0, $t0]
	#
	# Locals:
	#   - $s0: coord->row
	#   - $s1: coord->col
	#   - $t0: *coord
	# Structure:
	#   is_coord_out_of_bounds
	#   -> [prologue]
	#   -> body
	#	-> second_if_coord_out_of_bounds
	#	-> true_statement
	#	-> false_statement
	#   -> [epilogue]

is_coord_out_of_bounds__prologue:
	begin
	push 	$ra
	push 	$s0						# $s0 = coord->row
	push 	$s1						# $s1 = coord->col

is_coord_out_of_bounds__body:
	
	move 	$t0, $a0					# store coord into $t0
	lw 	$s0, 0($t0)					# stores cord->row into $s0
	lw 	$s1, 4($t0)					# stores cord->col into $s1

	blt 	$s0, 0, true_statement				# if (coord->row < 0); go to true_statement
	bge 	$s0, BOARD_SIZE, true_statement			# if (coord->row >= BOARD_SIZE); go to true_statement

	j 	second_if_coord_out_of_bounds 

second_if_coord_out_of_bounds:

	blt 	$s1, 0, true_statement				# if (coord->col < 0); go to true_statement
	bge 	$s1, BOARD_SIZE, true_statement			# if (coord->col >= BOARD_SIZE); go to true_statement

	j 	false_statement					# jump to false_statement

true_statement:
	li 	$v0, TRUE					# return TRUE;

	j 	is_coord_out_of_bounds__epilogue

false_statement:

	li 	$v0, FALSE					# return FALSE;

is_coord_out_of_bounds__epilogue:
	pop 	$s1
	pop	$s0
	pop 	$ra
	end
	
	jr	$ra						# return;


################################################################################
# .TEXT <is_overlapping>
# checks if ships overlap with each other - meaning it cannot be placed on board
.text
is_overlapping:
	# Args:
	#   - $a0: char[BOARD_SIZE][BOARD_SIZE] board
	#
	# Returns:
	#   - $v0: bool
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3]
	# Uses:     [$v0, $s0, $s1, $s2, $s3, $t0, $t1, $t4, $t5]
	# Clobbers: [$v0, $t0, $t1, $t4, $t5]
	#
	# Locals:
	#   - $s0: start.row
	#   - $s1: end.row
	#   - $s2: start.col
	#   - $s3: end.col
	#   - $t0: loaded start
	#   - $t1: loaded end
	#   - $t4: int col | int row
	#   - $t5: store array (EMPTY)		
	# Structure:
	#   is_overlapping
	#   -> [prologue]
	#   -> body
	#	-> is_overlapping_row_init
	#		-> for_loop_is_overlapping
	#	-> is_overlapping_vertical_init
	#		-> else_statement_for_loop
	#	-> true_overlap_statement
	#	-> return_false
	#   -> [epilogue]

is_overlapping__prologue:
	begin
	push 	$ra
	push 	$s0						# stores start.row
	push 	$s1						# stores end.row
	push 	$s2						# stores start.col
	push	$s3						# stores end.col
is_overlapping__body:

	la 	$t0, start					# load $s0 from start.row
	lw 	$s0, 0($t0)

	la 	$t1, end					# load $s1 from end.row
	lw 	$s1, 0($t1)					


	bne 	$s0, $s1, is_overlapping_vertical_init		# if (start.row != end.row); go to else_statement

	la 	$t0, start					# load $s2 from start.col
	lw 	$s2, 4($t0)					

	la 	$t1, end					# load $s3 from end.col
	lw 	$s3, 4($t1)	
				
is_overlapping_horizontal_init:
	move 	$t4, $s2					# int col = start.col

for_loop_is_overlapping:
	bgt 	$t4, $s3, is_overlapping_vertical_init		# col > end.col go to else_statement

	mul 	$t5, $s0, BOARD_SIZE				# initialise array
	add 	$t5, $t5, $t4
	mul 	$t5, $t5, 1
	add 	$t5, $t5, $a0
	lb 	$t5, ($t5)

	bne 	$t5, EMPTY, true_overlap_statement		# if (board[start.row][col] != EMPTY) (goto true_overlap_statement)

	addi 	$t4, $t4, 1					# col++;	
	j 	for_loop_is_overlapping

is_overlapping_vertical_init: 
	move 	$t4, $s0					# int row = start.row

	la 	$t0, start
	lw 	$s2, 4($t0)					# load $s2 from start.col


else_statement_for_loop:
	bgt 	$t4, $s1, return_false				# if (row > end.row); go to return_false

	mul 	$t5, $t4, BOARD_SIZE
	add 	$t5, $t5, $s2
	mul 	$t5, $t5, 1
	add 	$t5, $t5, $a0
	lb 	$t5, ($t5)

	bne 	$t5, EMPTY, true_overlap_statement		# if (board[row][start.col] != EMPTY); go to true_overlap_statement
	
	addi 	$t4, $t4, 1					# row++;				
	j 	else_statement_for_loop


true_overlap_statement:
	li 	$v0, TRUE					# return TRUE
	j 	is_overlapping__epilogue

return_false:
	li 	$v0, FALSE					# return FALSE

is_overlapping__epilogue:	
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <place_ship_on_board>
# successfully places ship on board if checks pass
.text
place_ship_on_board:
	# Args:
	#   - $a0: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $a1: char ship_type
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4, $s5]
	# Uses:     [$a0, $a1, $s0, $s1, $s2, $s3, $s4, $s5, $t0, $t1, $t4, $t5, $t6]
	# Clobbers: [$a0, $a1, $t0, $t1, $t4, $t5, $t6]
	#
	# Locals:
	#   - $s0: start.row
	#   - $s1: end.row
	#   - $s2: start.col
	#   - $s3: end.col
	#   - $s4: char[BOARD_SIZE][BOARD_SIZE] board
	#   - $s5:  char ship_type
	#   - $t0:  start[][]
	#   - $t1:  end[][]
	#   - $t4:  int col
	#   - $t5:  array initialised and stored
	#   - $t6:  array initialised and stored
	# Structure:
	#   place_ship_on_board
	#   -> [prologue]
	#   -> body
	#	-> place_ship_horizontal_init
	#		-> place_ship_for_loop
	#	-> place_ship_vertical_init
	#		-> else_statement_place_ship_loop
	#   -> [epilogue]

place_ship_on_board__prologue:
	begin
	push 	$ra
	push 	$s0						# start.row
	push	$s1						# end.row
	push 	$s2						# start.col
	push 	$s3								
	push 	$s4
	push	$s5
	
place_ship_on_board__body:

	move 	$s4, $a0					# $s4 = char[BOARD_SIZE][BOARD_SIZE] board
	move 	$s5, $a1					# $s5 = char ship_type
	
	la 	$t0, start
	lw 	$s0, 0($t0)					# $s0 = start.row
	lw 	$s2, 4($t0)					# $s2 = start.col

	la 	$t1, end
	lw 	$s1, 0($t1)					# $s1 = end.row
	lw 	$s3, 4($t1)					# $s3 = end.col

place_ship_horizontal_init:
	bne 	$s0, $s1, place_ship_vertical_init		# if (start.row != end.row) go to else_statement_place_ship

	move 	$t4, $s2					# int col = start.col

place_ship_for_loop:
	bgt 	$t4, $s3, place_ship_vertical_init		# col <= end.col; goto else_Statement_place_ship

	mul 	$t5, $s0, BOARD_SIZE				# initialise array
	add 	$t5, $t5, $t4
	mul 	$t5, $t5, 1
	add 	$t5, $t5, $s4
	
	lb 	$t6, ($t5)					# store ship_type into array ($t6)
	move 	$t6, $s5
	sb 	$t6, ($t5)

	addi 	$t4, $t4, 1					# col++;
	j 	place_ship_for_loop				# loop to place_ship_for_loop

place_ship_vertical_init:

	move 	$t4, $s0					# int row = start.row;

else_statement_place_ship_loop:
	bgt 	$t4, $s1, place_ship_on_board__epilogue		# if (row > end.row); goto place_ship_on_board_epilogue

	mul 	$t5, $t4, BOARD_SIZE				# initialise array
	add 	$t5, $t5, $s2
	mul 	$t5, $t5, 1
	add 	$t5, $t5, $s4

	lb 	$t6, ($t5)
	move 	$t6, $s5
	sb 	$t6, ($t5)

	addi 	$t4, $t4, 1					# row++;
	j 	else_statement_place_ship_loop			# loop to else_statement_place_ship_loop

place_ship_on_board__epilogue:
	pop 	$s5
	pop 	$s4
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;

################################################################################
# .TEXT <play_game>
# game begins  - called from main
.text
play_game:
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0]
	# Uses:     [$a0, $v0, $s0]
	# Clobbers: [$a0, $v0]
	#
	# Locals:
	#   - $s0: winner
	# Structure:
	#   play_game
	#   -> [prologue]
	#   -> body
	#	-> play_game_winner_init
	#	-> red_winner
	#	-> blue_winner
	#   -> [epilogue]

play_game__prologue:
	begin 
	push	$ra
	push 	$s0											

play_game__body:

	li 	$s0, WINNER_NONE				# int winner = WINNER_NONE;

play_game_winner_init:
	bne 	$s0, WINNER_NONE, red_winner			# if (winner != WINNER_NONE); go to end_of_while

	jal 	play_turn					#  play_turn();

	jal 	check_winner					#  winner = check_winner();
	move 	$s0, $v0

	j 	play_game_winner_init
	
red_winner:


	bne 	$s0, WINNER_RED, blue_winner			# if (winner != WINNER_RED); go to else_play_game
	
	la 	$a0, red_wins_str				# printf("RED wins!\n");
	li 	$v0, 4
	syscall
	
	j 	play_game__epilogue
	
blue_winner:

	la 	$a0, blue_wins_str				# printf("BLUE wins!\n");
	li 	$v0, 4
	syscall


play_game__epilogue:
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <play_turn>
# takes turn between the 2 players
.text
play_turn:
	# Args:     void
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3, $s4]
	# Uses:     [$a0, $v0, $s0, $s1, $s2, $s3, $s4, $t0, $t1]
	# Clobbers: [$a0, $v0, $t0, $t1]
	#
	# Locals:
	#   - $s0: whose_turn
	#   - $s1:  BLUE
	#   - $s2:  target.row
	#   - $s3:  target.col
	#   - $s4:  hit_status
	#   - $t0:  target
	#   - $t1:  return value from is_coord_out_of_bounds
	# Structure:
	#   play_turn
	#   -> [prologue]
	#   -> body
	#	-> play_turn_else
	#	-> play_turn_coordinates
	#	-> play_turn_hit_status
	#	-> play_turn_hit_else
	#	-> play_turn_hit_invalid
	#	-> play_turn_successful
	#	-> play_turn_swap
	#   -> [epilogue]

play_turn__prologue:
	begin
	push 	$ra
	push 	$s0
	push 	$s1
	push 	$s2
	push 	$s3
	push 	$s4

play_turn__body:

	lb 	$s0, whose_turn					# $s0 = whose_turn
	li 	$s1, BLUE					# $s1 = BLUE
	
	bne 	$s0, $s1, play_turn_else			# if (whose_turn != BLUE); goto play_turn_else

	la 	$a0, blue_turn_str				# printf("It is BLUE's turn!\n");
	li 	$v0, 4
	syscall

	la 	$a0, blue_view					# print_board(blue_view);
	jal 	print_board

	j 	play_turn_coordinates

play_turn_else:

	la 	$a0, red_turn_str				# printf("It is RED's turn!\n");
	li 	$v0, 4
	syscall 

	la 	$a0, red_view					# print_board(red_view);
	jal 	print_board

play_turn_coordinates:

	la 	$a0, enter_row_target_str			# printf("Please enter the row for your target: ");
	li 	$v0, 4
	syscall

	li 	$v0, 5						# scanf("%d", &target.row);
	syscall
	move 	$s2, $v0											

	la 	$t0, target					# store %d into target.row
	sw 	$s2, 0($t0)											


	la 	$a0, enter_col_target_str			# printf("Please enter the column for your target: ");
	li 	$v0, 4
	syscall

	li 	$v0, 5						# scanf("%d", &target.col);
	syscall
	move 	$s3, $v0											

	la 	$t0, target					# store %d into target.col
	sw 	$s3, 4($t0)

	move 	$a0, $t0					# is_coord_out_of_bounds(&target)
	jal 	is_coord_out_of_bounds
	move 	$t1, $v0							

	beq 	$t1, FALSE, play_turn_hit_status		# if (t1 == FALSE); go to play_turn_hit_status

	la 	$a0, invalid_coords_out_bounds_str		# printf("Coordinates out of bounds. Try again.\n");
	li 	$v0, 4
	syscall

	j 	play_turn__epilogue				# return;

play_turn_hit_status:					

	bne 	$s0, $s1, play_turn_hit_else			# if (whose_turn != BLUE); go to play_turn_hit_else

	la 	$a0, red_board					# perform_hit(red_board, blue_view);
	la 	$a1, blue_view
	jal 	perform_hit
	move 	$s4, $v0					# hit_status = perform_hit(red_board, blue_view);

	j 	play_turn_hit_invalid

play_turn_hit_else:

	la 	$a0, blue_board					# hit_status = perform_hit(blue_board, red_view);
	la 	$a1, red_view
	jal 	perform_hit
	move 	$s4, $v0


play_turn_hit_invalid:

	bne 	$s4, INVALID, play_turn_successful		# hit_status != INVALID; go to play_turn_next_if

	la 	$a0, invalid_coords_already_hit_str		# printf("You've already hit this target. Try again.\n");
	li 	$v0, 4
	syscall

	j 	play_turn__epilogue

play_turn_successful:

	bne 	$s4, HIT, play_turn_swap			# if (hit_status != HIT); go to play_turn_swap
	
	la 	$a0, hit_successful_str				# printf("Successful hit!\n");
	li 	$v0, 4
	syscall
	
	j 	play_turn__epilogue

play_turn_swap:

	la 	$a0, you_missed_str				# printf("Miss!\n");
	li 	$v0, 4
	syscall

	jal 	swap_turn					# swap_turn();

play_turn__epilogue:
	
	pop 	$s4
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <perform_hit>
# performs hit if coordinates are within the ship placement
.text
perform_hit:
	# Args:
	#   - $a0: char their_board[BOARD_SIZE][BOARD_SIZE]
	#   - $a1: char our_view[BOARD_SIZE][BOARD_SIZE]
	#
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3]
	# Uses:     [$v0, $s0, $s1, $s2, $s3, $t0, $t1, $t2]
	# Clobbers: [$v0, $t0, $t1, $t2]
	#
	# Locals:
	#   - $s0: their_board[BOARD_SIZE][BOARD_SIZE]
	#   - $s1: our_view[BOARD_SIZE][BOARD_SIZE]
	#   - $s2: target.row
	#   - $s3: target.col
	#   - $t0: target[][]
	#   - $t1: our_view[target.row][target.col]
	#   - $t2: saved our_view[target.row][target.col]
	# Structure:
	#   perform_hit
	#   -> [prologue]
	#   -> body
	#	-> perform_hit_if
	#	-> perform_hit_second_if
	#	-> perform_hit_miss_statement
	#   -> [epilogue]

perform_hit__prologue:
	begin
	push 	$ra
	push	$s0
	push 	$s1
	push 	$s2
	push 	$s3

perform_hit__body:

	move 	$s0, $a0					# $s0 = their_board[BOARD_SIZE][BOARD_SIZE]
	move 	$s1, $a1					# $s1 = our_view[BOARD_SIZE][BOARD_SIZE]

	la 	$t0, target										
	lw 	$s2, 0($t0)					# $s2 = target.row
	lw 	$s3, 4($t0)					# $s3 = target.col

	mul 	$t1, $s2, BOARD_SIZE				# initialise array
	add 	$t1, $t1, $s3
	mul 	$t1, $t1, 1
	add 	$t1, $t1, $s1
	lb 	$t1, ($t1)					# $t1 = our_view[target.row][target.col];

perform_hit_if:	

	beq 	$t1, EMPTY, perform_hit_second_if		# our_view[target.row][target.col] == EMPTY; go to perform_hit_second_if
	li 	$v0, INVALID					# return INVALID

	j 	perform_hit__epilogue

perform_hit_second_if:

	mul 	$t1, $s2, BOARD_SIZE				# their_board[target.row][target.col];
	add 	$t1, $t1, $s3
	mul 	$t1, $t1, 1
	add 	$t1, $t1, $s0
	lb 	$t1, ($t1)											

	beq 	$t1, EMPTY, perform_hit_miss_statement		# their_board[target.row][target.col] == EMPTY;

	mul 	$t1, $s2, BOARD_SIZE				# our_view[target.row][target.col] = HIT;
	add 	$t1, $t1, $s3
	mul 	$t1, $t1, 1
	add 	$t1, $t1, $s1
	lb 	$t2, ($t1)											
	li 	$t2, HIT
	sb 	$t2, ($t1)							

	li 	$v0, HIT					# return HIT
	j 	perform_hit__epilogue

perform_hit_miss_statement:
	
	mul 	$t1, $s2, BOARD_SIZE				# our_view[target.row][target.col] = MISS;
	add 	$t1, $t1, $s3
	mul 	$t1, $t1, 1
	add	$t1, $t1, $s1
	lb 	$t2, ($t1)
	li 	$t2, MISS
	sb 	$t2, ($t1)											

	li 	$v0, MISS					# return MISS

perform_hit__epilogue:
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <check_winner>
# checks if the winner is Red or Blue
.text
check_winner:
	# Args:	    void
	#
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra, $s0, $s1, $s2, $s3]
	# Uses:     [$a0, $a1, $v0, $s0, $s1, $s2, $s3, $t0, $t1]
	# Clobbers: [$a0, $a1]
	#
	# Locals:
	#   - $s0: red_board
	#   - $s1 = blue_view
	#   - $s2 = blue_board
	#   - $s3 = red_view
	#   - $t0 = return value from check_player_win
	#   - $t1 = return value from check_player_win
	
	# Structure:
	#   check_winner
	#   -> [prologue]
	#   -> body
	#	-> check_winner_blue
	#	-> check_winner_red
	#	-> no_winner_check
	#   -> [epilogue]

check_winner__prologue:
	begin
	push 	$ra
	push 	$s0
	push 	$s1
	push 	$s2
	push 	$s3

check_winner__body:
	
	li 	$s0, red_board					# $s0 = red_board
	li 	$s1, blue_view					# $s1 = blue_view

	move 	$a0, $s0					# check_player_win(red_board, blue_view)
	move 	$a1, $s1
	jal 	check_player_win
	move 	$t0, $v0

check_winner_blue:

	beq 	$t0, FALSE, check_winner_red			# if (check_player_win(red_board, blue_view) == FALSE); go to blue_board_check
	
	li 	$v0, WINNER_BLUE				# return WINNER_BLUE;
	j 	check_winner__epilogue

check_winner_red:

	li 	$s2, blue_board					# $s2 = blue_board
	li 	$s3, red_view					# $s3 = red_view

	move 	$a0, $s2					# check_player_win(blue_board, red_view);
	move 	$a1, $s3
	jal 	check_player_win
	move 	$t1, $v0							

	beq 	$t1, FALSE, no_winner_check			#  if (check_player_win(blue_board, red_view) == FALSE; go to no_winner_check
	li 	$v0, WINNER_RED
	j 	check_winner__epilogue

no_winner_check:
	li 	$v0, WINNER_NONE				# return WINNER_NONE

check_winner__epilogue:
	pop 	$s3
	pop 	$s2
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end

	jr	$ra						# return;


################################################################################
# .TEXT <check_player_win>
# checks if winner via array given
.text
check_player_win:
	# Args:
	#   - $a0: char[BOARD_SIZE][BOARD_SIZE] their_board
	#   - $a1: char[BOARD_SIZE][BOARD_SIZE] our_view
	#
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra, $s0, $s1]
	# Uses:     [$v0, $s0, $s1, $t0, $t1, $t2, $t3]
	# Clobbers: [$v0, $t1, $t2, $t3]
	#
	# Locals:
	#   - $s0:  char[BOARD_SIZE][BOARD_SIZE] their_board
	#   - $s1 = char[BOARD_SIZE][BOARD_SIZE] our_view;
	#   - $t0 = row
	#   - $t1 = col
	#   - $t2 = their_board[row][col]
	#   - $t3 =  our_view[row][col]
	# Structure:
	#   check_player_win
	#   -> [prologue]
	#   -> body
	#	-> check_player_win__init
	#	-> check_player_win__cond_row
	#		-> check_player_win__cond_col
	#		-> increment_col_check_winner
	#		-> increment_row_check_winner
	#	-> check_winner_return_true
	#   -> [epilogue]

check_player_win__prologue:
	begin
	push 	$ra
	push 	$s0
	push 	$s1

check_player_win__body:

	move 	$s0, $a0					# $s0 = char[BOARD_SIZE][BOARD_SIZE] their_board;
	move 	$s1, $a1					# $s1 = char[BOARD_SIZE][BOARD_SIZE] our_view;

check_player_win__init:

	li 	$t0, 0						# int row = 0;

check_player_win__cond_row:
	bge 	$t0, BOARD_SIZE, check_winner_return_true	# if (row >= BOARD_SIZE) go to check_winner_return_true
	li 	$t1, 0						# int col = 0;

check_player_win__cond_col:

	bge 	$t1, BOARD_SIZE, increment_row_check_winner	# if (col < BOARD_SIZE) go to increment_row_check_winner

	mul 	$t2, $t0, BOARD_SIZE				# their_board[row][col]
	add 	$t2, $t2, $t1
	mul 	$t2, $t2, 1
	add 	$t2, $t2, $s0
	lb 	$t2, ($t2)

	mul 	$t3, $t0, BOARD_SIZE				# our_view[row][col]
	add 	$t3, $t3, $t1
	mul 	$t3, $t3, 1
	add 	$t3, $t3, $s1
	lb 	$t3, ($t3)


	beq 	$t2, EMPTY, increment_col_check_winner		# if (their_board == EMPTY) go to increment_col_check_winner
	bne 	$t3, EMPTY, increment_col_check_winner		# if (our_view[row][col] != EMPTY) go to increment_col_check_winner

	li 	$v0, FALSE					# return FALSE;
	j 	check_player_win__epilogue

increment_col_check_winner:

	addi 	$t1, $t1, 1					# col++;
	j 	check_player_win__cond_col

increment_row_check_winner:

	addi 	$t0, $t0, 1					# row++;
	j 	check_player_win__cond_row

check_winner_return_true:

	li 	$v0, TRUE					# return TRUE;

check_player_win__epilogue:
	pop 	$s1
	pop 	$s0
	pop 	$ra
	end
	
	jr	$ra						# return;


################################################################################
################################################################################
###                 PROVIDED FUNCTIONS — DO NOT CHANGE THESE                 ###
################################################################################
################################################################################


################################################################################
# .TEXT <print_board>
# YOU DO NOT NEED TO CHANGE THE PRINT_BOARD FUNCTION
.text
print_board:
	# Args:
	#   - $a0: char[BOARD_SIZE][BOARD_SIZE] board
	#
	# Returns:  void
	#
	# Frame:    [$ra, $s0]
	# Uses:     [$a0, $v0, $t0, $t1, $t2, $t3, $t4, $s0]
	# Clobbers: [$a0, $v0, $t0, $t1, $t2, $t3, $t4]
	#
	# Locals:
	#   - $s0: saved $a0
	#   - $t0: col, row
	#   - $t1: col
	#   - $t2: [row][col]
	#   - $t3: &board[row][col]
	#   - $t4: board[row][col]
	#
	# Structure:
	#   print_board
	#   -> [prologue]
	#   -> body
	#      -> for_header_init
	#      -> for_header_cond
	#      -> for_header_body
	#      -> for_header_step
	#      -> for_header_post
	#      -> for_row_init
	#      -> for_row_cond
	#      -> for_row_body
	#         -> for_col_init
	#         -> for_col_cond
	#         -> for_col_body
	#         -> for_col_step
	#         -> for_col_post
	#      -> for_row_step
	#      -> for_row_post
	#   -> [epilogue]

print_board__prologue:
	begin							# begin a new stack frame
	push	$ra						# | $ra
	push	$s0						# | $s0

print_board__body:
	move 	$s0, $a0

	li	$v0, 11						# syscall 11: print_char
	la	$a0, ' '					#
	syscall							# printf("%c", ' ');
	syscall							# printf("%c", ' ');

print_board__for_header_init:
	li	$t0, 0						# int col = 0;

print_board__for_header_cond:
	bge	$t0, BOARD_SIZE, print_board__for_header_post	# if (col >= BOARD_SIZE) goto print_board__for_header_post;

print_board__for_header_body:
	li	$v0, 1						# syscall 1: print_int
	move	$a0, $t0					#
	syscall							# printf("%d", col);

	li	$v0, 11						# syscall 11: print_char
	li	$a0, ' '					#
	syscall							# printf("%c", ' ');

print_board__for_header_step:
	addiu	$t0, 1						# col++;
	b	print_board__for_header_cond

print_board__for_header_post:
	li	$v0, 11						# syscall 11: print_char
	la	$a0, '\n'					#
	syscall							# printf("%c", '\n');

print_board__for_row_init:
	li	$t0, 0						# int row = 0;

print_board__for_row_cond:
	bge	$t0, BOARD_SIZE, print_board__for_row_post	# if (row >= BOARD_SIZE) goto print_board__for_row_post;

print_board__for_row_body:
	li	$v0, 1						# syscall 1: print_int
	move	$a0, $t0					#
	syscall							# printf("%d", row);

	li	$v0, 11						# syscall 11: print_char
	li	$a0, ' '					#
	syscall							# printf("%c", ' ');

print_board__for_col_init:
	li	$t1, 0						# int col = 0;

print_board__for_col_cond:
	bge	$t1, BOARD_SIZE, print_board__for_col_post	# if (col >= BOARD_SIZE) goto print_board__for_col_post;

print_board__for_col_body:
	mul	$t2, $t0, BOARD_SIZE				# &board[row][col] = (row * BOARD_SIZE
	add	$t2, $t2, $t1					#		      + col)
	mul	$t2, $t2, 1					# 		      * sizeof(char)
	add 	$t3, $s0, $t2					# 		      + &board[0][0]
	lb	$t4, ($t3)					# board[row][col]

	li	$v0, 11						# syscall 11: print_char
	move	$a0, $t4					#
	syscall							# printf("%c", board[row][col]);

	li	$v0, 11						# syscall 11: print_char
	li	$a0, ' '					#
	syscall							# printf("%c", ' ');

print_board__for_col_step:
	addi	$t1, $t1, 1					# col++;
	b	print_board__for_col_cond			# goto print_board__for_col_cond;

print_board__for_col_post:
	li	$v0, 11						# syscall 11: print_char
	li	$a0, '\n'					#
	syscall							# printf("%c", '\n');

print_board__for_row_step:
	addi	$t0, $t0, 1					# row++;
	b	print_board__for_row_cond			# goto print_board__for_row_cond;

print_board__for_row_post:
print_board__epilogue:
	pop	$s0						# | $s0
	pop	$ra						# | $ra
	end							# ends the current stack frame

	jr	$ra						# return;


################################################################################
# .TEXT <swap_turn>
.text
swap_turn:
	# Args:	    void
	#
	# Returns:  void
	#
	# Frame:    []
	# Uses:     [$t0]
	# Clobbers: [$t0]
	#
	# Locals:
	#
	# Structure:
	#   swap_turn
	#   -> body
	#      -> red
	#      -> blue
	#   -> [epilogue]

swap_turn__body:
	lb	$t0, whose_turn
	bne	$t0, BLUE, swap_turn__blue			# if (whose_turn != BLUE) goto swap_turn__blue;

swap_turn__red:
	li	$t0, RED					# whose_turn = RED;
	sb	$t0, whose_turn					# 
	
	j	swap_turn__epilogue				# return;

swap_turn__blue:
	li	$t0, BLUE					# whose_turn = BLUE;
	sb	$t0, whose_turn					# 

swap_turn__epilogue:
	jr	$ra						# return;

################################################################################
# .TEXT <get_end_row>
.text
get_end_row:
	# Args:
	#   - $a0: int  start_row
	#   - $a1: char direction
	#   - $a2: int  ship_len
	#
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra]
	# Uses:     [$v0, $t0]
	# Clobbers: [$v0, $t0]
	#
	# Locals:
	#
	# Structure:
	#   get_end_row
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

get_end_row__prologue:
	begin							# begin a new stack frame
	push	$ra						# | $ra

get_end_row__body:
	move	$v0, $a0					
	beq	$a1, 'L', get_end_row__epilogue			# if (direction == 'L') return start_row;
	beq	$a1, 'R', get_end_row__epilogue			# if (direction == 'R') return start_row;

	sub	$t0, $a2, 1
	sub	$v0, $a0, $t0
	beq	$a1, 'U', get_end_row__epilogue			# if (direction == 'U') return start_row - (ship_len - 1);

	sub	$t0, $a2, 1
	add	$v0, $a0, $t0
	beq	$a1, 'D', get_end_row__epilogue			# if (direction == 'D') return start_row + (ship_len - 1);

	li	$v0, INVALID					# return INVALID;

get_end_row__epilogue:
	pop	$ra						# | $ra
	end							# ends the current stack frame

	jr	$ra						# return;


################################################################################
# .TEXT <get_end_col>
.text
get_end_col:
	# Args:
	#   - $a0: int  start_col
	#   - $a1: char direction
	#   - $a2: int  ship_len
	#
	# Returns:
	#   - $v0: int
	#
	# Frame:    [$ra]
	# Uses:     [$v0, $t0]
	# Clobbers: [$v0, $t0]
	#
	# Locals:
	#
	# Structure:
	#   get_end_col
	#   -> [prologue]
	#   -> body
	#   -> [epilogue]

get_end_col__prologue:
	begin							# begin a new stack frame
	push	$ra						# | $ra

get_end_col__body:
	move	$v0, $a0					
	beq	$a1, 'U', get_end_col__epilogue			# if (direction == 'U') return start_col;
	beq	$a1, 'D', get_end_col__epilogue			# if (direction == 'D') return start_col;

	sub	$t0, $a2, 1
	sub	$v0, $a0, $t0
	beq	$a1, 'L', get_end_col__epilogue			# if (direction == 'L') return start_col - (ship_len - 1);

	sub	$t0, $a2, 1
	add	$v0, $a0, $t0
	beq	$a1, 'R', get_end_col__epilogue			# if (direction == 'R') return start_col + (ship_len - 1);

	li	$v0, INVALID					# return INVALID;

get_end_col__epilogue:
	pop	$ra						# | $ra
	end							# ends the current stack frame

	jr	$ra						# return;
