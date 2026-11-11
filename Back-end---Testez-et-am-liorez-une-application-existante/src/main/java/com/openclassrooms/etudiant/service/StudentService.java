package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.dto.StudentRequestDTO;
import com.openclassrooms.etudiant.dto.StudentResponseDTO;
import com.openclassrooms.etudiant.entities.Student;
import com.openclassrooms.etudiant.handler.ResourceNotFoundException;
import com.openclassrooms.etudiant.mapper.StudentDtoMapper;
import com.openclassrooms.etudiant.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentDtoMapper studentDtoMapper;

    @Transactional
    public StudentResponseDTO create(StudentRequestDTO request) {
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Student with email " + request.getEmail() + " already exists");
        }
        Student saved = studentRepository.save(studentDtoMapper.toEntity(request));
        return studentDtoMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<StudentResponseDTO> findAll() {
        return studentRepository.findAll().stream().map(studentDtoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public StudentResponseDTO findById(Long id) {
        return studentDtoMapper.toDto(getStudent(id));
    }

    @Transactional
    public StudentResponseDTO update(Long id, StudentRequestDTO request) {
        Student student = getStudent(id);
        if (studentRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new IllegalArgumentException("Student with email " + request.getEmail() + " already exists");
        }
        studentDtoMapper.updateEntity(request, student);
        return studentDtoMapper.toDto(studentRepository.save(student));
    }

    @Transactional
    public void delete(Long id) {
        studentRepository.delete(getStudent(id));
    }

    private Student getStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student with id " + id + " not found"));
    }
}
