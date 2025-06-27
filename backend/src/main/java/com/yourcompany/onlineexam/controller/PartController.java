package com.yourcompany.onlineexam.controller;

import com.yourcompany.onlineexam.model.Part;
import com.yourcompany.onlineexam.service.PartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "http://localhost:5173")
public class PartController {
    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    public ResponseEntity<List<Part>> getAllParts(@RequestParam(value = "search", required = false) String search) {
        try {
            if (search != null && !search.isEmpty()) {
                return ResponseEntity.ok(partService.searchParts(search));
            }
            return ResponseEntity.ok(partService.getAllParts());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Part> getPartById(@PathVariable String id) {
        try {
            Part part = partService.getPartById(id);
            if (part == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(part);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createPart(@RequestBody Part part) {
        try {
            Part created = partService.createPart(part);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi server!");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePart(@PathVariable String id, @RequestBody Part part) {
        try {
            Part updated = partService.updatePart(id, part);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi server!");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable String id) {
        try {
            partService.deletePart(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
} 