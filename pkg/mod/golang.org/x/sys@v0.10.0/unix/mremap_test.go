// Copyright 2023 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

//go:build linux
// +build linux

package unix_test

import (
	"testing"

	"golang.org/x/sys/unix"
)

func TestMremap(t *testing.T) {
	b, err := unix.Mmap(-1, 0, unix.Getpagesize(), unix.PROT_NONE, unix.MAP_ANON|unix.MAP_PRIVATE)
	if err != nil {
		t.Fatalf("Mmap: %v", err)
	}
	if err := unix.Mprotect(b, unix.PROT_READ|unix.PROT_WRITE); err != nil {
		t.Fatalf("Mprotect: %v", err)
	}

	b[0] = 42

	bNew, err := unix.Mremap(b, unix.Getpagesize()*2, unix.MREMAP_MAYMOVE)
	if err != nil {
		t.Fatalf("Mremap2: %v", err)
	}
	bNew[unix.Getpagesize()+1] = 84 // checks

	if bNew[0] != 42 {
		t.Fatal("first element value was changed")
	}
	if len(bNew) != unix.Getpagesize()*2 {
		t.Fatal("new memory len not equal to specified len")
	}
	if cap(bNew) != unix.Getpagesize()*2 {
		t.Fatal("new memory cap not equal to specified len")
	}

	_, err = unix.Mremap(b, unix.Getpagesize(), unix.MREMAP_FIXED)
	if err != unix.EINVAL {
		t.Fatalf("unix.MREMAP_FIXED should be forbidden")
	}
}
